import { first, uniq } from 'lodash';
import urlRegex from 'url-regex';
import config from '../../../constants/config';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { formatGmailAddress } from '../../fetch/google/fetch-people';
import { ISegment, attendee, responseStatus, segmentState } from '../../store/data-types';
import { getIdFromLink } from '../../store/models/document-model';

export const getStateForMeeting = (event: gapi.client.calendar.Event): segmentState => {
  const currentTime = new Date();
  if (!event.end || !event.start) {
    return 'past';
  }

  if (event.end > currentTime && event.start < currentTime) {
    return 'current';
  } else if (event.end > currentTime) {
    return 'upcoming';
  } else return 'past';
};

export const getDocumentsFromCalendarEvents = (event: {
  description?: string;
  attachments?: gapi.client.calendar.EventAttachment[];
}) => {
  const documentIds: string[] = [];
  const documentUrls: string[] = [];
  const urls = event.description ? uniq(event.description.match(urlRegex())) : [];
  (urls || []).forEach((url) => {
    if (url.includes('https://docs.google.com')) {
      const link = getIdFromLink(url);
      documentIds.push(link);
      documentUrls.push(url);
    }
  });
  (event.attachments || []).map((attachment: gapi.client.calendar.EventAttachment) => {
    if (attachment.fileId) {
      documentIds.push(attachment.fileId);
    }
  });
  return { documentIds, documentUrls };
};

const getVideoLinkFromCalendarEvent = (event: gapi.client.calendar.Event) => {
  if (event.hangoutLink) {
    return event.hangoutLink;
  }
  const meetingDescriptionLinks = event.description ? event.description.match(urlRegex()) : [];
  return first(
    meetingDescriptionLinks?.filter(
      (link) => link.includes('zoom.us') || link.includes('webex.com'),
    ),
  );
};

const formatSegment = (event?: gapi.client.calendar.Event): ISegment | null => {
  if (!event?.id) {
    return null;
  }

  const documents = getDocumentsFromCalendarEvents(event);
  const videoLink = getVideoLinkFromCalendarEvent(event);
  const start = new Date(event.start!.dateTime!);
  const end = new Date(event.end!.dateTime!);
  return {
    id: event.id,
    link: event.htmlLink,
    summary: event.summary,
    start,
    end,
    hangoutLink: event.hangoutLink,
    location: event.location,
    reminders: event.reminders,
    selfResponseStatus: getSelfResponseStatus(event.attendees || []),
    creator: event.creator,
    organizer: event.organizer,
    attachments: event.attachments || [],
    description: event.description,
    attendees: (event.attendees || [])
      .filter(
        (attendee) => attendee.email && !attendee.resource, // filter out conference rooms
      )
      .map((a) => ({
        ...a,
        email: a.email ? formatGmailAddress(a.email) : undefined,
      })),
    documentIdsFromDescription: documents.documentIds,
    meetingNotesLink: first(documents.documentUrls),
    videoLink,
    state: getStateForMeeting(event),
  };
};

export const getSelfResponseStatus = (attendees: attendee[]): responseStatus => {
  for (const person of attendees) {
    if (person.self) {
      return (person.responseStatus as any) || 'accepted';
    }
  }
  if (attendees.length < 1) {
    return 'accepted';
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
  // NOTE: Events created programatically may have a non-self user as the only guest.
  // We default to 'attending' and only filter out not attending if the user is confirmed not attending above.
  return true;
};

const fetchCalendarEvents = async (
  addEmailAddressesToStore: (emails: string[]) => any,
  authToken: string,
) => {
  const params = {
    calendarId: 'primary',
    maxResults: '2500', // Max before building pagination
    singleEvents: 'true',
    orderBy: 'updated', // starttime does not work :shrug:
    timeMin: config.startDate.toISOString(),
    timeMax: config.endDate.toISOString(),
  };

  const calendarResponse = await fetch(
    `https://content.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams(
      params,
    ).toString()}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  );
  const calendarBody = await calendarResponse.json();
  if (!calendarResponse.ok) {
    RollbarErrorTracking.logErrorInfo(JSON.stringify(params));
    RollbarErrorTracking.logErrorInRollbar(calendarResponse.statusText);
  }
  const filteredCalendarEvents =
    calendarBody && calendarBody.items ? (calendarBody.items as gapi.client.calendar.Event[]) : [];

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
          event &&
          event.id &&
          event.start &&
          event.start.dateTime &&
          event.end &&
          event.end.dateTime &&
          (!config.SHOULD_FILTER_OUT_NOT_ATTENDING_EVENTS ||
            isSelfConfirmedAttending(event.attendees || [], event.creator)),
      )
      .map((event) => formatSegment(event))
      .filter(Boolean) as ISegment[],
    // calendar events return little attendee information beyond email addresses (contradicting docs)
    uniqueAttendeeEmails,
  };
};

export default fetchCalendarEvents;
