import { isAfter, isBefore } from 'date-fns';
import { ICalendarEvent } from '../fetch/fetch-first';
import { formattedEmail } from '../fetch/fetch-second';
import { DriveActivity } from '../types/activity';

interface ISegment extends ICalendarEvent {
  driveActivity: DriveActivity[];
  emails: formattedEmail[];
}

export default class TimeStore {
  private segments: ISegment[];

  constructor(calendarEvents: ICalendarEvent[]) {
    console.warn('setting up time store');
    this.segments = this.createInitialSegments(calendarEvents);
  }

  createInitialSegments(calendarEvents: ICalendarEvent[]) {
    return calendarEvents
      .filter((event) => event.start && event.end)
      .map((event) => ({
        ...event,
        emails: [],
        driveActivity: [],
      }));
  }

  addEmailsToStore(emails: formattedEmail[]) {
    emails.forEach((email) => {
      // NOTE: SUPER SLOW (design a segment storage system)
      this.segments.forEach((segment) => {
        if (isAfter(email.date, segment.start) && isBefore(email.date, segment.end)) {
          segment.emails.push(email);
        }
      });
    });
  }

  addDriveActivityToStore(driveActivity: DriveActivity[]) {
    driveActivity
      // TODO: filter earlier
      .filter((activity) => activity.timestamp)
      .forEach((activity) => {
        // NOTE: SUPER SLOW
        // TODO: Design  segment storage system or add optimizations assuming segments are ordered
        const start = new Date(activity.timestamp!);
        this.segments.forEach((segment) => {
          if (isAfter(start, segment.start) && isBefore(start, segment.end)) {
            segment.driveActivity.push(activity);
          }
        });
      });
  }

  getLength() {
    return this.segments.length;
  }
}
