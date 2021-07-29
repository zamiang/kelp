import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { flatten } from 'lodash';
import { IPerson, ISegment, attendee, responseStatus, segmentState } from '../../store/data-types';
import { getGraphCalendarInstancesEndpoint, graphConfig, tokenRequest } from './auth-config';
import { callMSGraph } from './fetch-helper';
import { getTokenPopup } from './fetch-token';

type ResponseType =
  | 'none'
  | 'organizer'
  | 'tentativelyAccepted'
  | 'accepted'
  | 'declined'
  | 'notResponded';
type FreeBusyStatus = 'unknown' | 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere';
type Importance = 'low' | 'normal' | 'high';
type BodyType = 'text' | 'html';
type EventType = 'singleInstance' | 'occurrence' | 'exception' | 'seriesMaster';
type PhoneType =
  | 'home'
  | 'business'
  | 'mobile'
  | 'other'
  | 'assistant'
  | 'homeFax'
  | 'businessFax'
  | 'otherFax'
  | 'pager'
  | 'radio';
type OnlineMeetingProviderType =
  | 'unknown'
  | 'skypeForBusiness'
  | 'skypeForConsumer'
  | 'teamsForBusiness';
type PhysicalAddressType = 'unknown' | 'home' | 'business' | 'other';
type LocationType =
  | 'default'
  | 'conferenceRoom'
  | 'homeAddress'
  | 'businessAddress'
  | 'geoCoordinates'
  | 'streetAddress'
  | 'hotel'
  | 'restaurant'
  | 'localBusiness'
  | 'postalAddress';
type LocationUniqueIdType = 'unknown' | 'locationStore' | 'directory' | 'private' | 'bing';

interface OutlookGeoCoordinates {
  /**
   * The accuracy of the latitude and longitude. As an example, the accuracy can be measured in meters, such as the latitude
   * and longitude are accurate to within 50 meters.
   */
  accuracy?: number;
  // The altitude of the location.
  altitude?: number;
  // The accuracy of the altitude.
  altitudeAccuracy?: number;
  // The latitude of the location.
  latitude?: number;
  // The longitude of the location.
  longitude?: number;
}

interface PhysicalAddress {
  // The city.
  city?: string;
  // The country or region. It's a free-format string value, for example, 'United States'.
  countryOrRegion?: string;
  // The postal code.
  postalCode?: string;
  // The post office box number.
  postOfficeBox?: string;
  // The state.
  state?: string;
  // The street.
  street?: string;
  // The type of address. Possible values are: unknown, home, business, other.
  type?: PhysicalAddressType;
}

interface Location {
  // The street address of the location.
  address?: PhysicalAddress;
  // The geographic coordinates and elevation of the location.
  coordinates?: OutlookGeoCoordinates;
  // The name associated with the location.
  displayName?: string;
  // Optional email address of the location.
  locationEmailAddress?: string;
  /**
   * The type of location. Possible values are: default, conferenceRoom, homeAddress, businessAddress,geoCoordinates,
   * streetAddress, hotel, restaurant, localBusiness, postalAddress. Read-only.
   */
  locationType?: LocationType;
  // Optional URI representing the location.
  locationUri?: string;
  // For internal use only.
  uniqueId?: string;
  // For internal use only.
  uniqueIdType?: LocationUniqueIdType;
}

interface Phone {
  // The phone number.
  number?: string;
  /**
   * The type of phone number. Possible values are: home, business, mobile, other, assistant, homeFax, businessFax,
   * otherFax, pager, radio.
   */
  type?: PhoneType;
}

interface OnlineMeetingInfo {
  // The ID of the conference.
  conferenceId?: string;
  /**
   * The external link that launches the online meeting. This is a URL that clients will launch into a browser and will
   * redirect the user to join the meeting.
   */
  joinUrl?: string;
  // All of the phone numbers associated with this conference.
  phones?: Phone[];
  // The pre-formatted quickdial for this call.
  quickDial?: string;
  // The toll free numbers that can be used to join the conference.
  tollFreeNumbers?: string[];
  // The toll number that can be used to join the conference.
  tollNumber?: string;
}

interface ItemBody {
  // The content of the item.
  content?: string;
  // The type of the content. Possible values are text and html.
  contentType?: BodyType;
}

interface DateTimeTimeZone {
  // A single point of time in a combined date and time representation ({date}T{time}). For example, '2019-04-16T09:00:00'.
  dateTime?: string;
  // Represents a time zone, for example, 'Pacific Standard Time'. See below for possible values.
  timeZone?: string;
}

interface ResponseStatus {
  // The response type. Possible values are: None, Organizer, TentativelyAccepted, Accepted, Declined, NotResponded.
  response?: ResponseType;
  /**
   * The date and time that the response was returned. It uses ISO 8601 format and is always in UTC time. For example,
   * midnight UTC on Jan 1, 2014 is 2014-01-01T00:00:00Z
   */
  time?: string;
}

interface TimeSlot {
  // The date, time, and time zone that a period begins.
  end?: DateTimeTimeZone;
  // The date, time, and time zone that a period ends.
  start?: DateTimeTimeZone;
}

type AttendeeType = 'required' | 'optional' | 'resource';

interface EmailAddress {
  // The email address of an entity instance.
  address?: string;
  // The display name of an entity instance.
  name?: string;
}

interface Recipient {
  // The recipient's email address.
  emailAddress?: EmailAddress;
}

interface Attendee {
  emailAddress?: EmailAddress;
  /**
   * The type of attendee. Possible values are: required, optional, resource. Currently if the attendee is a person,
   * findMeetingTimes always considers the person is of the Required type.
   */
  type?: AttendeeType;
  /**
   * An alternate date/time proposed by the attendee for a meeting request to start and end. If the attendee hasn't proposed
   * another time, then this property is not included in a response of a GET event.
   */
  proposedNewTime?: TimeSlot;
  // The attendee's response (none, accepted, declined, etc.) for the event and date-time that the response was sent.
  status?: ResponseStatus;
}

interface Event {
  id: string;
  /**
   * True if the meeting organizer allows invitees to propose a new time when responding, false otherwise. Optional. Default
   * is true.
   */
  createdDateTime?: string;
  /**
   * The Timestamp type represents date and time information using ISO 8601 format and is always in UTC time. For example,
   * midnight UTC on Jan 1, 2014 is 2014-01-01T00:00:00Z
   */
  lastModifiedDateTime?: string;

  allowNewTimeProposals?: boolean;
  // The collection of attendees for the event.
  attendees?: Attendee[];
  // The body of the message associated with the event. It can be in HTML or text format.
  body?: ItemBody;
  // The preview of the message associated with the event. It is in text format.
  bodyPreview?: string;
  /**
   * Contains occurrenceId property values of cancelled instances in a recurring series, if the event is the series master.
   * Instances in a recurring series that are cancelled are called cancelledOccurences.Returned only on $select in a Get
   * operation which specifies the id of a series master event (that is, the seriesMasterId property value).
   */
  cancelledOccurrences?: string[];
  // The date, time, and time zone that the event ends. By default, the end time is in UTC.
  end?: DateTimeTimeZone;
  // Set to true if the event has attachments.
  hasAttachments?: boolean;
  /**
   * When set to true, each attendee only sees themselves in the meeting request and meeting Tracking list. Default is
   * false.
   */
  hideAttendees?: boolean;
  // The importance of the event. The possible values are: low, normal, high.
  importance?: Importance;
  // Set to true if the event lasts all day.
  isAllDay?: boolean;
  // Set to true if the event has been canceled.
  isCancelled?: boolean;
  /**
   * Set to true if the user has updated the meeting in Outlook but has not sent the updates to attendees. Set to false if
   * all changes have been sent, or if the event is an appointment without any attendees.
   */
  isDraft?: boolean;
  // True if this event has online meeting information, false otherwise. Default is false. Optional.
  isOnlineMeeting?: boolean;
  /**
   * Set to true if the calendar owner (specified by the owner property of the calendar) is the organizer of the event
   * (specified by the organizer property of the event). This also applies if a delegate organized the event on behalf of
   * the owner.
   */
  isOrganizer?: boolean;
  // Set to true if an alert is set to remind the user of the event.
  isReminderOn?: boolean;
  // The location of the event.
  location?: Location;
  /**
   * The locations where the event is held or attended from. The location and locations properties always correspond with
   * each other. If you update the location property, any prior locations in the locations collection would be removed and
   * replaced by the new location value.
   */
  locations?: Location[];
  occurrenceId?: string;
  // Details for an attendee to join the meeting online. Read-only.
  onlineMeeting?: OnlineMeetingInfo;
  /**
   * Represents the online meeting service provider. The possible values are teamsForBusiness, skypeForBusiness, and
   * skypeForConsumer. Optional.
   */
  onlineMeetingProvider?: OnlineMeetingProviderType;
  /**
   * A URL for an online meeting. The property is set only when an organizer specifies an event as an online meeting such as
   * a Skype meeting. Read-only.
   */
  onlineMeetingUrl?: string;
  // The organizer of the event.
  organizer?: Recipient;
  /**
   * The end time zone that was set when the event was created. A value of tzone://Microsoft/Custom indicates that a legacy
   * custom time zone was set in desktop Outlook.
   */
  originalEndTimeZone?: string;
  /**
   * The Timestamp type represents date and time information using ISO 8601 format and is always in UTC time. For example,
   * midnight UTC on Jan 1, 2014 is 2014-01-01T00:00:00Z
   */
  originalStart?: string;
  /**
   * The start time zone that was set when the event was created. A value of tzone://Microsoft/Custom indicates that a
   * legacy custom time zone was set in desktop Outlook.
   */
  originalStartTimeZone?: string;
  // The recurrence pattern for the event.
  // recurrence?: PatternedRecurrence;
  // The number of minutes before the event start time that the reminder alert occurs.
  reminderMinutesBeforeStart?: number;
  // Default is true, which represents the organizer would like an invitee to send a response to the event.
  responseRequested?: boolean;
  // Indicates the type of response sent in response to an event message.
  responseStatus?: ResponseStatus;
  // The possible values are: normal, personal, private, confidential.
  // sensitivity?: Sensitivity;
  // The ID for the recurring series master item, if this event is part of a recurring series.
  seriesMasterId?: string;
  // The status to show. The possible values are: free, tentative, busy, oof, workingElsewhere, unknown.
  showAs?: FreeBusyStatus;
  // The date, time, and time zone that the event starts. By default, the start time is in UTC.
  start?: DateTimeTimeZone;
  // The text of the event's subject line.
  subject?: string;
  /**
   * A custom identifier specified by a client app for the server to avoid redundant POST operations in case of client
   * retries to create the same event. This is useful when low network connectivity causes the client to time out before
   * receiving a response from the server for the client's prior create-event request. After you set transactionId when
   * creating an event, you cannot change transactionId in a subsequent update. This property is only returned in a response
   * payload if an app has set it. Optional.
   */
  transactionId?: string;
  // The event type. The possible values are: singleInstance, occurrence, exception, seriesMaster. Read-only.
  type?: EventType;
  uid?: string;
  /**
   * The URL to open the event in Outlook on the web.Outlook on the web opens the event in the browser if you are signed in
   * to your mailbox. Otherwise, Outlook on the web prompts you to sign in.This URL cannot be accessed from within an
   * iFrame.
   */
  webLink?: string;
  /**
   * The collection of FileAttachment, ItemAttachment, and referenceAttachment attachments for the event. Navigation
   * property. Read-only. Nullable.
   */
  // attachments?: Attachment[];
  // The calendar that contains the event. Navigation property. Read-only.
  // calendar?: Calendar;
  exceptionOccurrences?: Event[];
  // The collection of open extensions defined for the event. Nullable.
  // extensions?: Extension[];
  /**
   * The occurrences of a recurring series, if the event is a series master. This property includes occurrences that are
   * part of the recurrence pattern, and exceptions that have been modified, but does not include occurrences that have been
   * cancelled from the series. Navigation property. Read-only. Nullable.
   */
  instances?: Event[];
  // The collection of multi-value extended properties defined for the event. Read-only. Nullable.
  //multiValueExtendedProperties?: MultiValueLegacyExtendedProperty[];
  // The collection of single-value extended properties defined for the event. Read-only. Nullable.
  // singleValueExtendedProperties?: SingleValueLegacyExtendedProperty[];
}

const getStateForMeeting = (start?: Date, end?: Date): segmentState => {
  const currentTime = new Date();
  if (!start || !end) {
    return 'past';
  }

  if (end > currentTime && start < currentTime) {
    return 'current';
  } else if (end > currentTime) {
    return 'upcoming';
  } else return 'past';
};

/*
type ResponseType =
  | 'none'
  | 'organizer'
  | 'tentativelyAccepted'
  | 'accepted'
  | 'declined'
  | 'notResponded';
  */
const formatResponseStatus = (status?: ResponseType): responseStatus => {
  if (status === 'none') {
    return 'needsAction';
  } else if (status === 'organizer') {
    return 'accepted';
  } else if (status === 'tentativelyAccepted') {
    return 'tentative';
  } else if (status === 'declined') {
    return 'declined';
  } else if (status === 'notResponded') {
    return 'needsAction';
  }
  return 'notAttending';
};

const formatCalendarEvent = (event: Event, currentUser: IPerson): ISegment | null => {
  const videoLink = event.onlineMeetingUrl;
  const start = event.start?.dateTime ? new Date(`${event.start?.dateTime}+0000`) : undefined;
  const end = event.end?.dateTime ? new Date(`${event.end?.dateTime}+0000`) : undefined;
  if (!start || !end) {
    return null;
  }
  const creator = event?.organizer?.emailAddress?.address?.includes('outlook_')
    ? undefined
    : { email: event.organizer?.emailAddress?.address };

  return {
    id: event.id,
    link: event.webLink,
    summary: event.subject,
    start,
    end,
    location: event.location?.displayName,
    reminders: undefined,
    selfResponseStatus: formatResponseStatus(event.responseStatus?.response),
    creator: creator || currentUser,
    organizer: creator || currentUser,
    description: event.body?.content?.trim(),
    attendees: (event.attendees || [])
      .filter(
        (attendee) => attendee.emailAddress?.address && attendee.type !== 'resource', // filter out conference rooms
      )
      .map(
        (a): attendee => ({
          email: a.emailAddress?.address,
          self: a.emailAddress?.address === currentUser.id,
        }),
      )
      .filter((a) => a.email && !a.email.split('@')[0].includes('outlook_')),
    documentIdsFromDescription: [],
    attachments: [],
    meetingNotesLink: undefined,
    videoLink,
    state: getStateForMeeting(start, end),
  };
};

const handleRecurringEvent = async (event: Event, accessToken: string, currentUser: IPerson) => {
  const result = await callMSGraph(getGraphCalendarInstancesEndpoint(event.id), accessToken);
  return result.value.map((e: Event) => formatCalendarEvent(e, currentUser));
};

export const fetchCalendar = async (
  activeAccount?: AccountInfo,
  msal?: IPublicClientApplication,
  currentUser?: IPerson,
): Promise<ISegment[]> => {
  if (activeAccount && msal && currentUser) {
    const token = await getTokenPopup(tokenRequest, activeAccount, msal).catch((error) => {
      console.log(error, 'getTokenPopup failure');
    });
    if (token) {
      const result = await callMSGraph(graphConfig.graphCalendarEndpoint, token.accessToken);
      const regularEvents = result.value
        .filter((event: Event) => !(event as any).recurrence)
        .map((event: Event) => formatCalendarEvent(event, currentUser));
      const recurringEvents = await Promise.all(
        result.value
          .filter((event: Event) => !!(event as any).recurrence)
          .map(async (event: Event) => handleRecurringEvent(event, token.accessToken, currentUser)),
      );

      console.log(regularEvents, 'regular events');
      console.log(recurringEvents, 'regular events');

      return regularEvents
        .concat(flatten(recurringEvents))
        .filter((e: ISegment) => e.selfResponseStatus !== 'notAttending');
    }
  }
  return [];
};
