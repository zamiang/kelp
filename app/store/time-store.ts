import { isAfter, isBefore } from 'date-fns';
import { ICalendarEvent, IFormattedDriveActivity } from '../fetch/fetch-first';
import { formattedEmail } from '../fetch/fetch-second';

export interface ISegment extends ICalendarEvent {
  driveActivityIds: string[];
  emailIds: string[];
}

interface ISegmentsByID {
  [id: string]: ISegment;
}

export default class TimeStore {
  private segments: ISegment[];
  private segmentsById: ISegmentsByID;

  constructor(calendarEvents: ICalendarEvent[]) {
    console.warn('setting up time store');
    // sort by asc to support later optimizations
    this.segments = this.createInitialSegments(calendarEvents).sort((a, b) =>
      a.start > b.start ? -1 : 1,
    );
    this.segmentsById = {};
    this.segments.map((segment) => (this.segmentsById[segment.id] = segment));
  }

  getSegmentById(id: string) {
    return this.segmentsById[id];
  }

  createInitialSegments(calendarEvents: ICalendarEvent[]) {
    return calendarEvents
      .filter((event) => event.start && event.end)
      .map((event) => ({
        ...event,
        emailIds: [],
        driveActivityIds: [],
      }));
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

  getUpcommingSegments(filterOutSegmentId?: string) {
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
