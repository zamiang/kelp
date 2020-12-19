import { addMinutes, format, getWeek, isAfter, isBefore, isSameDay, subMinutes } from 'date-fns';
import getUrls from 'get-urls';
import { first, flatten, groupBy, intersection } from 'lodash';
import config from '../../constants/config';
import { ICalendarEvent } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { getGoogleDocsIdFromLink } from './document-store';
import PersonDataStore from './person-store';

type SegmentState = 'current' | 'upcoming' | 'past';

// todo: https://en.wikipedia.org/wiki/ICalendar#:~:text=The%20file%20format%20is%20specified,formerly%20Lotus%20Notes)%2C%20Yahoo!
export interface IFormattedAttendee {
  readonly personId: string; // for lookup in the person store
  readonly responseStatus?: string;
  readonly self?: boolean;
}

interface IEvent {
  start: Date;
  end: Date;
}

export const getStateForMeeting = (event: IEvent): SegmentState => {
  const currentTime = new Date();
  if (event.end > currentTime && event.start < currentTime) {
    return 'current';
  } else if (event.end > currentTime) {
    return 'upcoming';
  } else return 'past';
};

export interface ISegment extends ICalendarEvent {
  readonly driveActivityIds: string[];
  readonly attendeeDriveActivityIds: string[];
  readonly currentUserDriveActivityIds: string[];
  readonly state: SegmentState;
  readonly formattedAttendees: IFormattedAttendee[];
  readonly formattedOrganizer?: IFormattedAttendee;
  readonly formattedCreator?: IFormattedAttendee;
  readonly documentIdsFromDescription: string[];
}

interface ISegmentsByID {
  [id: string]: ISegment;
}

const getDocumentIdsFromCalendarEvents = (event: ICalendarEvent) => {
  const documentIds: string[] = [];

  const urls: string[] = event.description ? (getUrls(event.description) as any) : [];
  urls.forEach((url) => {
    if (url.includes('https://docs.google.com')) {
      documentIds.push(getGoogleDocsIdFromLink(url));
    }
  });
  return documentIds;
};

export default class TimeStore {
  private segments: ISegment[];
  private segmentsById: ISegmentsByID;

  constructor(calendarEvents: ICalendarEvent[], personStore: PersonDataStore) {
    // console.warn('setting up time store');
    // sort by asc to support later optimizations
    this.segments = this.createInitialSegments(calendarEvents, personStore).sort((a, b) =>
      a.start > b.start ? -1 : 1,
    );
    this.segmentsById = {};
    this.segments.map((segment) => (this.segmentsById[segment.id] = segment));
  }

  getSegmentById(id: string): ISegment | undefined {
    return this.segmentsById[id];
  }

  createInitialSegments(calendarEvents: ICalendarEvent[], personStore: PersonDataStore) {
    return calendarEvents
      .filter((event) => event.start && event.end)
      .map((event) => {
        const formattedAttendees = event.attendees
          .filter((attendee) => !!attendee.email)
          .map((attendee) => ({
            personId: personStore.getPersonIdForEmailAddress(attendee.email!),
            responseStatus: attendee.responseStatus,
            self: attendee.self,
          }));
        const formattedOrganizer =
          event.organizer && event.organizer.email
            ? {
                personId: personStore.getPersonIdForEmailAddress(event.organizer.email),
                responseStatus: 'attending' as any,
                self: event.organizer.self,
              }
            : undefined;
        const formattedCreator =
          event.creator && event.creator.email
            ? {
                personId: personStore.getPersonIdForEmailAddress(event.creator.email),
                responseStatus: 'attending' as any,
                self: event.creator.self,
              }
            : undefined;
        const documentIds = getDocumentIdsFromCalendarEvents(event);
        return {
          ...event,
          formattedAttendees,
          formattedOrganizer,
          formattedCreator,
          documentIdsFromDescription: documentIds,
          driveActivityIds: [],
          attendeeDriveActivityIds: [],
          currentUserDriveActivityIds: [],
          state: getStateForMeeting(event),
        };
      });
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[], personStore: PersonDataStore) {
    driveActivity
      // TODO: filter earlier
      .filter((activity) => activity.time)
      .forEach((activity) => {
        // NOTE: SUPER SLOW
        // TODO: Design  segment storage system or add optimizations assuming segments are ordered
        const start = activity.time;
        this.segments.forEach((segment) => {
          if (activity.actorPersonId) {
            if (isAfter(start, segment.start) && isBefore(start, segment.end)) {
              const actor = personStore.getPersonById(activity.actorPersonId);
              if (!actor) {
                return;
              }
              // documents edited by current user during meeting
              if (actor.isCurrentUser) {
                segment.currentUserDriveActivityIds.push(activity.id);
              } else {
                // documents edited by attendees
                const isActorAttending = segment.formattedAttendees
                  .filter((a) => a.responseStatus === 'accepted')
                  .map((a) => a.personId)
                  .includes(actor.id);
                if (isActorAttending) {
                  segment.attendeeDriveActivityIds.push(activity.id);
                }
              }
              // all edits
              segment.driveActivityIds.push(activity.id);
            }
          }
        });
      });
  }

  getLength() {
    return this.segments.length;
  }

  getSegments(order: 'asc' | 'desc' = 'asc') {
    return this.segments.sort((a, b) => {
      if (order === 'asc') {
        return a.start > b.start ? -1 : 1;
      } else {
        return a.start < b.start ? -1 : 1;
      }
    });
  }

  getCurrentSegment() {
    const segments = this.getSegments();
    const start = subMinutes(new Date(), config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);
    const end = addMinutes(new Date(), 30 + config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);
    return first(
      segments.filter((segment) => {
        const isUpNext = segment.start > start && segment.start < end;
        const isCurrent = start > segment.start && start < segment.end;
        return segment.selfResponseStatus === 'accepted' && (isUpNext || isCurrent);
      }),
    );
  }

  getSegmentsByDay() {
    const segments = this.getSegments();
    return groupBy(segments, (segment) => format(segment.start, 'EEEE, MMM d yyyy'));
  }

  getSegmentsForDay(day: Date) {
    return this.getSegments().filter((segment) => isSameDay(segment.start, day));
  }

  getSegmentsForWeek(week: number) {
    return this.getSegments().filter((segment) => getWeek(segment.start) == week);
  }

  getDriveActivityIdsForDate(date: Date) {
    return flatten(
      this.segments
        .filter((segment) => isSameDay(segment.start, date))
        .map((segment) => segment.driveActivityIds),
    );
  }

  getListedDocumentIdsForDay(date: Date) {
    return flatten(
      this.segments
        .filter((segment) => isSameDay(segment.start, date))
        .map((segment) => segment.documentIdsFromDescription),
    );
  }

  getFormattedGuestStats(segment: ISegment) {
    const guestStatsHash = {
      needsAction: 'awaiting response',
      declined: 'no',
      tentative: 'maybe',
      accepted: 'yes',
      notAttending: 'no',
    } as any;

    if (segment.formattedAttendees.length < 2) {
      return null;
    }
    const guestStats = {
      accepted: 0,
      tentative: 0,
      needsAction: 0,
      declined: 0,
      notAttending: 0,
    } as any;
    segment.formattedAttendees.map(
      (attendee) => attendee.responseStatus && guestStats[attendee.responseStatus]++,
    );

    return Object.keys(guestStats)
      .map((key) => {
        if (guestStats[key]) {
          // eslint-disable-next-line
          return `${guestStats[key as any]} ${guestStatsHash[key]}`;
        }
        return false;
      })
      .filter((text) => !!text)
      .join(', ');
  }

  getDriveActivityIdsForWeek(week: number) {
    const segments = flatten(
      this.segments
        .filter((segment) => getWeek(segment.start) === week)
        .map((segment) => segment.driveActivityIds),
    );
    return segments;
  }

  // Segments with activity by current user
  getSegmentsWithCurrentUserDriveActivity(driveActivityIds: string[]) {
    return this.segments.filter(
      (segment) => intersection(driveActivityIds, segment.currentUserDriveActivityIds).length > 0,
    );
  }

  // Segments with activity by attendees
  getSegmentsWithAttendeeDriveActivity(driveActivityIds: string[]) {
    return this.segments.filter(
      (segment) => intersection(driveActivityIds, segment.attendeeDriveActivityIds).length > 0,
    );
  }
}
