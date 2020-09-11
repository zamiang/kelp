import { format, isAfter, isBefore } from 'date-fns';
import { groupBy } from 'lodash';
import { ICalendarEvent } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { formattedEmail } from '../fetch/fetch-emails';
import PersonDataStore from './person-store';

type SegmentState = 'current' | 'upcoming' | 'past';

export interface IFormattedAttendee {
  personId: string; // for lookup in the person store
  responseStatus?: string;
  self?: boolean;
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
  driveActivityIds: string[];
  emailIds: string[];
  state: SegmentState;
  formattedAttendees: IFormattedAttendee[];
}

interface ISegmentsByID {
  [id: string]: ISegment;
}

export default class TimeStore {
  private segments: ISegment[];
  private segmentsById: ISegmentsByID;

  constructor(calendarEvents: ICalendarEvent[], personStore: PersonDataStore) {
    console.warn('setting up time store');
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
        return {
          ...event,
          formattedAttendees,
          emailIds: [],
          driveActivityIds: [],
          state: getStateForMeeting(event),
        };
      });
  }

  addEmailsToStore(emails: formattedEmail[]) {
    emails.forEach((email) => {
      // NOTE: SUPER SLOW (design a segment storage system)
      this.segments.forEach((segment) => {
        if (isAfter(email.date, segment.start) && isBefore(email.date, segment.end)) {
          segment.emailIds.push(email.id);
        }
      });
    });
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    driveActivity
      // TODO: filter earlier
      .filter((activity) => activity.time)
      .forEach((activity) => {
        // NOTE: SUPER SLOW
        // TODO: Design  segment storage system or add optimizations assuming segments are ordered
        const start = activity.time;
        this.segments.forEach((segment) => {
          if (isAfter(start, segment.start) && isBefore(start, segment.end)) {
            segment.driveActivityIds.push(activity.id);
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

  getSegmentsByDay() {
    const segments = this.getSegments();
    return groupBy(segments, (segment) => format(segment.start, 'EEEE, MMM d'));
  }

  getupcomingSegments(filterOutSegmentId?: string) {
    const currentTime = new Date();
    return this.segments.filter(
      (segment) => segment.end > currentTime && segment.id !== filterOutSegmentId,
    );
  }

  getCurrentOrUpNextSegments() {
    const currentTime = new Date();
    return this.segments.filter(
      (segment) => segment.end > currentTime && segment.start < currentTime,
    );
  }

  getPastSegments(filterOutSegmentId?: string) {
    const currentTime = new Date();
    return this.segments.filter(
      (segment) => segment.end < currentTime && segment.id !== filterOutSegmentId,
    );
  }
}
