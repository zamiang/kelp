import { getDayOfYear } from 'date-fns';
import { flatten } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { formatGmailAddress } from '../../fetch/google/fetch-people';
import { getWeek } from '../../shared/date-helpers';
import { IFormattedAttendee, IPerson, ISegment } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';

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
  async addAttendeesToStore(segments: ISegment[], personDataStore: IStore['personDataStore']) {
    const attendees = await Promise.all(
      segments.map(async (segment) => {
        const attendees = segment.attendees;
        if (attendees.filter((a) => a.self).length < 1) {
          attendees.push(segment.creator as any);
        }
        return await Promise.all(
          attendees.map(async (attendee) => {
            if (attendee.email) {
              const person = await personDataStore.getByEmail(attendee.email);
              if (person) {
                return formatAttendee(attendee, person, segment);
              } else {
                console.error('missing', attendee);
              }
            }
          }),
        );
      }),
    );
    const tx = this.db.transaction('attendee', 'readwrite');
    // console.log(attendees, 'about to save attendees');

    const results = await Promise.allSettled(
      flatten(attendees).map(async (s) => s && tx.store.put(s)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async getForWeek(week: number) {
    return this.db.getAllFromIndex('attendee', 'by-week', week);
  }

  async getForNextDays(date: Date) {
    const day = getDayOfYear(date);
    return (await this.getForDay(day))
      .concat(await this.getForDay(day + 1))
      .concat(await this.getForDay(day + 2))
      .concat(await this.getForDay(day + 3));
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
