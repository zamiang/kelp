import { getDayOfYear } from 'date-fns';
import { formatGmailAddress } from '../../fetch/fetch-people';
import { getWeek } from '../../shared/date-helpers';
import { dbType } from '../db';
import { IPerson } from './person-model';
import { ISegment } from './segment-model';

export interface IFormattedAttendee {
  readonly id: string;
  readonly personId?: string;
  readonly personGoogleId?: string;
  readonly emailAddress?: string;
  readonly responseStatus?: string;
  readonly self?: boolean;
  readonly segmentId: string;
  readonly week: number;
  readonly day: number;
  readonly date: Date;
}

interface IAttendee {
  readonly email?: string;
  readonly responseStatus?: string;
  readonly self?: boolean;
}

const formatAttendee = (
  attendee: IAttendee,
  person: IPerson,
  segment: ISegment,
): IFormattedAttendee => ({
  id: `${segment.id}-${person.id}`,
  segmentId: segment.id,
  personId: person.id,
  personGoogleId: person.googleId || undefined,
  responseStatus: attendee.responseStatus,
  self: attendee.self,
  emailAddress: attendee.email ? formatGmailAddress(attendee.email) : undefined,
  week: getWeek(segment.start),
  day: getDayOfYear(segment.start),
  date: segment.start,
});

export default class AttendeeModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  // We need to make sure the current user is an attendee of all meetings
  async addAttendeesToStore(segments: ISegment[]) {
    return Promise.all(
      segments.map(async (segment) => {
        const attendees = segment.attendees;
        if (attendees.filter((a) => a.self).length < 1) {
          attendees.push(segment.creator as any);
        }
        return await Promise.all(
          attendees.map(async (attendee) => {
            const people = await this.db.getAllFromIndex('person', 'by-email', attendee.email);
            if (people[0] && people[0].id) {
              return this.db.put('attendee', formatAttendee(attendee, people[0], segment));
            } else {
              console.error('missing', attendee, people);
            }
          }),
        );
      }),
    );
  }

  async getForWeek(week: number) {
    return this.db.getAllFromIndex('attendee', 'by-week', week);
  }

  async getForDay(day: number) {
    return this.db.getAllFromIndex('attendee', 'by-day', day);
  }

  async getAllForSegmentId(segmentId: string) {
    return this.db.getAllFromIndex('attendee', 'by-segment-id', segmentId);
  }

  async getAll() {
    return await this.db.getAll('attendee');
  }
}
