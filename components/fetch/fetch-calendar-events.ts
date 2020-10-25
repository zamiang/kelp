import { addDays } from 'date-fns';
import { uniq } from 'lodash';
import config from '../../constants/config';

/**
 * The attendee's response status. Possible values are:
 * - "needsAction" - The attendee has not responded to the invitation.
 * - "declined" - The attendee has declined the invitation.
 * - "tentative" - The attendee has tentatively accepted the invitation.
 * - "accepted" - The attendee has accepted the invitation.
 */
type responseStatus = 'needsAction' | 'declined' | 'tentative' | 'accepted' | 'notAttending';

type attendee = {
  readonly email?: string;
  readonly responseStatus?: string;
  readonly self?: boolean;
};

export interface ICalendarEvent {
  readonly id: string;
  readonly link?: string;
  readonly summary?: string;
  readonly start: Date;
  readonly end: Date;
  readonly description?: string;
  readonly selfResponseStatus: responseStatus;
  readonly creator?: {
    readonly email?: string;
    // NOTE: these are null ~100% of the time
    readonly displayName?: string;
    readonly id?: string;
    readonly self?: boolean;
  };
  readonly organizer?: {
    readonly email?: string;
    readonly displayName?: string;
    readonly id?: string;
    readonly self?: boolean;
  };
  readonly attendees: attendee[];
}

export const getSelfResponseStatus = (attendees: attendee[]) => {
  for (const person of attendees) {
    if (person.self) {
      return person.responseStatus as responseStatus;
    }
  }
  return 'notAttending';
};

const isSelfConfirmedAttending = (attendees: attendee[], creator?: attendee) => {
  if (attendees.length < 1 && creator && creator.self) {
    return true;
  }

  for (const person of attendees) {
    if (person.self) {
      return config.GOOGLE_CALENDAR_FILTER.indexOf(person.responseStatus || '') < 0;
    }
  }
  return false;
};

const fetchCalendarEvents = async (addEmailAddressesToStore: (emails: string[]) => any) => {
  const calendarResponse = await gapi.client.calendar.events.list({
    calendarId: 'primary',
    maxResults: 250,
    singleEvents: true,
    orderBy: 'updated', // starttime does not work :shrug:
    // timeMin: config.startDate.toISOString(),
    // timeMax: addDays(new Date(), 1).toISOString(),
  });

  const filteredCalendarEvents =
    calendarResponse && calendarResponse.result && calendarResponse.result.items
      ? calendarResponse.result.items
      : [];

  const emailAddresses: string[] = [];
  filteredCalendarEvents.map((event) => {
    if (event.creator?.email) {
      emailAddresses.push(event.creator.email);
    }
    if (event.organizer?.email) {
      emailAddresses.push(event.organizer.email);
    }
    return (event.attendees || []).map((attendee) => {
      attendee.email && !attendee.resource && emailAddresses.push(attendee.email);
    });
  });

  const uniqueAttendeeEmails = uniq(emailAddresses);
  addEmailAddressesToStore(uniqueAttendeeEmails);
  return {
    calendarEvents: filteredCalendarEvents
      .filter(
        (event) =>
          event.id &&
          event.start &&
          event.start.dateTime &&
          event.end &&
          event.end.dateTime &&
          (!config.SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS ||
            isSelfConfirmedAttending(event.attendees || [], event.creator)),
      )
      .map((event) => ({
        id: event.id!,
        link: event.htmlLink,
        summary: event.summary,
        start: new Date(event.start!.dateTime!),
        end: new Date(event.end!.dateTime!),
        // TODO: Handle lack of enum type in the google calendar library
        selfResponseStatus: getSelfResponseStatus(event.attendees || []),
        creator: event.creator,
        organizer: event.organizer,
        attendees: (event.attendees || []).filter(
          (attendee) => attendee.email && !attendee.resource, // filter out conference rooms
        ),
        description: event.description,
      })),
    // calendar events return little attendee information beyond email addresses (contradicting docs)
    uniqueAttendeeEmails,
  };
};

export default fetchCalendarEvents;
