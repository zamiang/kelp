import { getDayOfYear } from 'date-fns';
import { getWeek } from '../../shared/date-helpers';
import { dbType } from '../db';
import { IPerson } from './person-model';
import { ISegment } from './segment-model';

export interface IFormattedAttendee {
  readonly id: string;
  readonly personId?: string;
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
  responseStatus: attendee.responseStatus,
  self: attendee.self,
  emailAddress: attendee.email,
  week: getWeek(segment.start),
  day: getDayOfYear(segment.start),
  date: segment.start,
});

export default class AttendeeModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addAttendeesToStore(segments: ISegment[]) {
    await Promise.all(
      segments.map(
        async (segment) =>
          await Promise.all(
            segment.attendees.map(async (attendee) => {
              const person = await this.db.getAllFromIndex('person', 'by-email', attendee.email);
              if (person[0] && person[0].id) {
                return this.db.put('attendee', formatAttendee(attendee, person[0], segment));
              } else {
                console.error('missing', attendee.email);
              }
            }),
          ),
      ),
    );
    return;
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
