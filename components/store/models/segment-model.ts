import { addMinutes, format, getDate, getWeek, isSameDay, subMinutes } from 'date-fns';
import { first, flatten, groupBy, uniq } from 'lodash';
import urlRegex from 'url-regex';
import config from '../../../constants/config';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { ICalendarEvent } from '../../fetch/fetch-calendar-events';
import { formatGmailAddress } from '../../fetch/fetch-people';
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
  readonly videoLink?: string;
  readonly meetingNotesLink?: string;
}

export const getDocumentsFromCalendarEvents = (event: ICalendarEvent) => {
  const documentIds: string[] = [];
  const documentUrls: string[] = [];
  const urls = event.description ? uniq(event.description.match(urlRegex())) : [];
  (urls || []).forEach((url) => {
    if (url.includes('https://docs.google.com')) {
      const link = getGoogleDocsIdFromLink(url);
      documentIds.push(link);
      documentUrls.push(url);
    }
  });
  (event.attachments || []).map((attachment) => {
    if (attachment.fileId) {
      documentIds.push(attachment.fileId);
    }
  });
  return { documentIds, documentUrls };
};

const getVideoLinkFromCalendarEvent = (event: ICalendarEvent) => {
  if (event.hangoutLink) {
    return event.hangoutLink;
  }
  const meetingDescriptionLinks = event.description ? event.description.match(urlRegex()) : [];
  return first(
    meetingDescriptionLinks?.filter(
      (link) => link.includes('zoom.us') || link.includes('webex.com'),
    ),
  );
};

const formatSegments = (calendarEvents: ICalendarEvent[]) =>
  calendarEvents
    .filter((event) => event.start && event.end)
    .map((event) => {
      const documents = getDocumentsFromCalendarEvents(event);
      const videoLink = getVideoLinkFromCalendarEvent(event);
      return {
        ...event,
        attendees: event.attendees.map((a) => ({
          ...a,
          email: a.email ? formatGmailAddress(a.email) : undefined,
        })),
        documentIdsFromDescription: documents.documentIds,
        meetingNotesLink: first(documents.documentUrls),
        videoLink,
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
    // console.log(formattedSegments, 'about to save segments');
    const tx = this.db.transaction('meeting', 'readwrite');
    const results = await Promise.allSettled(formattedSegments.map((event) => tx.store.put(event)));
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
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

  async getDriveActivityIdsForDate(date: number) {
    const segments = await this.getAll();
    // this.db.getAllFromIndex('segmentDriveActivity', 'segment-id //segment.driveActivityIds),
    flatten(segments.filter((segment) => getDate(segment.start) === date).map(() => []));
    return segments;
  }
}
