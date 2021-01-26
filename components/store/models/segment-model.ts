import { addMinutes, format, getWeek, isSameDay, subMinutes } from 'date-fns';
import getUrls from 'get-urls';
import { first, flatten, groupBy } from 'lodash';
import config from '../../../constants/config';
import { ICalendarEvent } from '../../fetch/fetch-calendar-events';
import { dbType } from '../db';
import { getGoogleDocsIdFromLink } from './document-model';

type SegmentState = 'current' | 'upcoming' | 'past';

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
  readonly state: SegmentState;
  readonly documentIdsFromDescription: string[];
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

const formatSegments = (calendarEvents: ICalendarEvent[]) =>
  calendarEvents
    .filter((event) => event.start && event.end)
    .map((event) => {
      const documentIds = getDocumentIdsFromCalendarEvents(event);
      return {
        ...event,
        documentIdsFromDescription: documentIds,
        state: getStateForMeeting(event),
      };
    });

export default class SegmentModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addSegments(calendarEvents: ICalendarEvent[]) {
    const formattedSegments = formatSegments(calendarEvents);
    const tx = this.db.transaction('meeting', 'readwrite');
    await Promise.all(formattedSegments.map((event) => tx.store.add(event)));
    return tx.done;
  }

  async getById(id: string): Promise<ISegment | undefined> {
    return this.db.get('meeting', id);
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

  async getSegmentsByDay() {
    const segments = await this.getAll();
    return groupBy(segments, (segment) => format(segment.start, 'EEEE, MMM d yyyy'));
  }

  async getSegmentsForDay(day: Date) {
    // TODO: Use a where
    const segments = await this.getAll();
    return segments.filter((segment) => isSameDay(segment.start, day));
  }

  async getSegmentsForWeek(week: number) {
    const segments = await this.getAll();
    return segments.filter((segment) => getWeek(segment.start) == week);
  }

  async getListedDocumentIdsForDay(date: Date) {
    // TODO: Use a where
    const segments = await this.getAll();
    return flatten(
      segments
        .filter((segment) => isSameDay(segment.start, date))
        .map((segment) => segment.documentIdsFromDescription),
    );
  }

  async getSegmentsForPersonId(personId: string) {
    const attendees = await this.db.getAllFromIndex('attendee', 'by-person-id', personId);
    return Promise.all(attendees.map((attendee) => this.db.get('meeting', attendee.segmentId)));
  }

  async getDriveActivityIdsForWeek(week: number) {
    const segments = await this.getAll();
    // this.db.getAllFromIndex('segmentDriveActivity', 'segment-id //segment.driveActivityIds),
    flatten(segments.filter((segment) => getWeek(segment.start) === week).map(() => []));
    return segments;
  }
}
