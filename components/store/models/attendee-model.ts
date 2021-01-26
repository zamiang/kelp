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
}

interface IAttendee {
  readonly email?: string;
  readonly responseStatus?: string;
  readonly self?: boolean;
}

const formatAttendee = (
  attendee: IAttendee,
  person: IPerson,
  segmentId: string,
): IFormattedAttendee => ({
  id: `${segmentId}-${person.id}`,
  segmentId,
  personId: person.id,
  responseStatus: attendee.responseStatus,
  self: attendee.self,
  emailAddress: attendee.email,
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
                return this.db.put('attendee', formatAttendee(attendee, person[0], segment.id));
              } else {
                console.error('missing', attendee.email);
              }
            }),
          ),
      ),
    );
    return;
  }

  async getAllForSegmentId(segmentId: string) {
    return this.db.getAllFromIndex('attendee', 'by-segment-id', segmentId);
  }

  async getAll() {
    return await this.db.getAll('attendee');
  }
}
