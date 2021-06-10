import { addMinutes, format, getDate, getWeek, isSameDay, subMinutes } from 'date-fns';
import { first, flatten, groupBy } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { ISegment } from '../data-types';
import { dbType } from '../db';

export default class SegmentModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addSegments(segments: ISegment[], shouldClearStore?: boolean) {
    if (shouldClearStore) {
      const existingSegments = await this.getAll();
      const existingSegmentIds = existingSegments.map((s) => s.id);
      const newSegmentIds = segments.map((s) => s.id);
      const idsToDelete = existingSegmentIds.filter(
        (existingSegmentId) => !newSegmentIds.includes(existingSegmentId),
      );

      await Promise.allSettled(idsToDelete.map((id) => this.db.delete('meeting', id)));
    }

    // console.log(formattedSegments, 'about to save segments');
    const tx = this.db.transaction('meeting', 'readwrite');
    const results = await Promise.allSettled(segments.map((event) => tx.store.put(event)));
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async getById(id: string): Promise<ISegment | undefined> {
    return this.db.get('meeting', id);
  }

  async getBulk(ids: string[]): Promise<ISegment[]> {
    return Promise.all(ids.map((id) => this.db.get('meeting', id))) as any;
  }

  async getAll() {
    return this.db.getAll('meeting');
  }

  async getSegments(order: 'asc' | 'desc' = 'asc') {
    const meetings = await this.getAll();
    return meetings.sort((a, b) => {
      if (order === 'asc') {
        return a.start > b.start ? -1 : 1;
      } else {
        return a.start < b.start ? -1 : 1;
      }
    });
  }

  async getUpNextSegment() {
    const segments = await this.getAll();
    const start = subMinutes(new Date(), config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);
    return first(
      segments.filter((segment) => {
        const isUpNext =
          start < segment.start &&
          new Date() > subMinutes(segment.start, config.MEETING_PREP_NOTIFICATION_EARLY_MINUTES);
        return segment.selfResponseStatus === 'accepted' && isUpNext;
      }),
    );
  }

  // TODO: Use an index
  async getCurrentSegment() {
    const segments = await this.getAll();
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

  async getCurrentSegmentForWebsites() {
    const segments = await this.getAll();
    const start = new Date();
    return first(
      segments.filter((segment) => {
        const isCurrent = start > segment.start && start < segment.end;
        return segment.selfResponseStatus === 'accepted' && isCurrent;
      }),
    );
  }

  async getSegmentsByDay(start: Date) {
    const segments = await this.getAll();
    const filteredSegments = segments.filter((s) => s.start > start);

    return groupBy(
      filteredSegments.sort((a, b) => (new Date(a.start) > new Date(b.start) ? 1 : -1)),
      (segment) => format(segment.start, 'EEEE, MMM d yyyy'),
    );
  }

  async getSegmentsForDay(day: Date) {
    // TODO: Use an index
    const segments = await this.getAll();
    return segments.filter((segment) => isSameDay(segment.start, day));
  }

  async getSegmentsForWeek(week: number) {
    const segments = await this.getAll();
    return segments.filter((segment) => getWeek(segment.start) == week);
  }

  async getListedDocumentIdsForDay(date: Date) {
    // TODO: Use an index
    const segments = await this.getAll();
    return flatten(
      segments
        .filter((segment) => isSameDay(segment.start, date))
        .map((segment) => segment.documentIdsFromDescription),
    );
  }

  async getSegmentsForEmail(email: string) {
    const attendees = await this.db.getAllFromIndex('attendee', 'by-email', email);
    return Promise.all(attendees.map((attendee) => this.db.get('meeting', attendee.segmentId)));
  }

  async getDriveActivityIdsForWeek(week: number) {
    const segments = await this.getAll();
    flatten(segments.filter((segment) => getWeek(segment.start) === week).map(() => []));
    return segments;
  }

  async getDriveActivityIdsForDate(date: number) {
    const segments = await this.getAll();
    flatten(segments.filter((segment) => getDate(segment.start) === date).map(() => []));
    return segments;
  }
}
