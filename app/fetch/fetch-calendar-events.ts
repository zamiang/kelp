import { addDays } from 'date-fns';
import { uniq } from 'lodash';
import { startDate } from './fetch-first';

/**
 * The attendee's response status. Possible values are:
 * - "needsAction" - The attendee has not responded to the invitation.
 * - "declined" - The attendee has declined the invitation.
 * - "tentative" - The attendee has tentatively accepted the invitation.
 * - "accepted" - The attendee has accepted the invitation.
 */
export type responseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted';

export interface ICalendarEvent {
  id: string;
  link?: string;
  summary?: string;
  start: Date;
  end: Date;
  description?: string;
  selfResponseStatus: responseStatus | 'needsAction';
  attendees: {
    email?: string;
    responseStatus?: string;
    self?: boolean;
  }[];
}

// todo move these
export type attendee = {
  email?: string;
  responseStatus?: string;
  self?: boolean;
};

export const getSelfResponseStatus = (attendees: attendee[]) => {
  for (const person of attendees) {
    if (person.self) {
      return person.responseStatus as responseStatus;
    }
  }
  return 'needsAction';
};

const fetchCalendarEvents = async (addEmailAddressesToStore: (emails: string[]) => any) => {
  const calendarResponse = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    maxAttendees: 10,
    maxResults: 80,
    singleEvents: true,
    orderBy: 'updated', // starttime does not work :shrug:
    timeMin: startDate.toISOString(),
    timeMax: addDays(new Date(), 1).toISOString(),
  });

  const filteredCalendarEvents =
    calendarResponse && calendarResponse.result && calendarResponse.result.items
      ? calendarResponse.result.items
      : [];

  const emailAddresses: string[] = [];
  filteredCalendarEvents.map((event) =>
    (event.attendees || []).map((attendee) => {
      attendee.email && emailAddresses.push(attendee.email);
    }),
  );

  const uniqueAttendeeEmails = uniq(emailAddresses);
  addEmailAddressesToStore(uniqueAttendeeEmails);
  return {
    calendarEvents: filteredCalendarEvents
      .filter(
        (event) =>
          event.id && event.start && event.start.dateTime && event.end && event.end.dateTime,
      )
      .map((event) => ({
        id: event.id!,
        link: event.htmlLink,
        summary: event.summary,
        start: new Date(event.start!.dateTime!),
        end: new Date(event.end!.dateTime!),
        // TODO: Handle lack of enum type in the google calendar library
        selfResponseStatus: getSelfResponseStatus(event.attendees || []),
        attendees: (event.attendees || []).filter((attendee) => attendee.email),
        description: event.description,
      })),
    // calendar events return little attendee information beyond email addresses (contradicting docs)
    uniqueAttendeeEmails,
  };
};

export default fetchCalendarEvents;
