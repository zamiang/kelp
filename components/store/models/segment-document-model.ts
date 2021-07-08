import { getDayOfYear } from 'date-fns';
import { flatten, orderBy, uniqBy } from 'lodash';
import ErrorTracking from '../../error-tracking/error-tracking';
import { getWeek } from '../../shared/date-helpers';
import { removePunctuationRegex } from '../../shared/tfidf';
import { IFormattedDriveActivity, ISegment, ISegmentDocument } from '../data-types';
import { dbType } from '../db';
import AttendeeModel from './attendee-model';
import DriveActivityModel from './drive-activity-model';
import PersonModel from './person-model';
import SegmentModel from './segment-model';

export const formatSegmentTitle = (text?: string) =>
  text
    ? text.replace(removePunctuationRegex, '').split(' ').join('').toLocaleLowerCase()
    : undefined;

const formatSegmentDocument = (
  driveActivity: IFormattedDriveActivity,
  segment?: ISegment,
  isPersonAttendee?: boolean,
  isPersonCurrentUser?: boolean,
): ISegmentDocument => ({
  id: driveActivity.id,
  driveActivityId: driveActivity.id,
  documentId: driveActivity.documentId!,
  segmentId: segment?.id,
  segmentTitle: formatSegmentTitle(segment?.summary),
  category: isPersonCurrentUser ? 'self' : isPersonAttendee ? 'attendee' : 'non-attendee',
  isPersonAttendee,
  date: driveActivity.time,
  reason: driveActivity.action,
  personId: driveActivity.actorPersonId!,
  day: getDayOfYear(driveActivity.time),
  week: getWeek(driveActivity.time),
});

const formatSegmentDocumentFromDescription = (
  segment: ISegment,
  documentId: string,
  personId: string,
): ISegmentDocument => ({
  id: `${segment.id}-${documentId}`,
  documentId,
  segmentId: segment.id,
  segmentTitle: formatSegmentTitle(segment.summary),
  date: segment.start,
  category: 'meeting-description',
  reason: 'Listed in meeting description',
  personId,
  isPersonAttendee: true,
  day: getDayOfYear(segment.start),
  week: getWeek(segment.start),
});

export default class SegmentDocumentModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addSegmentDocumentsToStore(
    driveActivityStore: DriveActivityModel,
    timeStore: SegmentModel,
    attendeeStore: AttendeeModel,
    personStore: PersonModel,
  ) {
    const driveActivity = await driveActivityStore.getAll();
    const segments = await timeStore.getAll();

    // Add drive activity for meetings
    const driveActivityToAdd = await Promise.all(
      driveActivity.map(async (driveActivityItem) => {
        let isActorAttendee = false;
        let isActorCurrentUser = false;
        const segment = segments.find(
          (s) => s.start < driveActivityItem.time && s.end > driveActivityItem.time,
        );
        if (segment) {
          const summary = segment.summary?.toLocaleLowerCase();
          if (!summary?.includes('ooo') && !summary?.includes('out of office')) {
            const attendees = await attendeeStore.getAllForSegmentId(segment.id);
            const people = await personStore.getBulkByEmail(
              attendees.map((a) => a.emailAddress).filter(Boolean) as string[],
            );
            isActorAttendee = !!people.find(
              (a) =>
                driveActivityItem.actorPersonId &&
                a.googleIds.includes(driveActivityItem.actorPersonId),
            );
            isActorCurrentUser = !!attendees.find((a) => a.self);
          }
        }
        const formattedDocument = formatSegmentDocument(
          driveActivityItem,
          segment,
          isActorAttendee,
          isActorCurrentUser,
        );
        return formattedDocument;
      }),
    );

    // Add drive activity in meeting descriptions
    const descriptionsToAdd = await Promise.all(
      segments.map(async (segment) => {
        const attendees = await attendeeStore.getAllForSegmentId(segment.id);
        return segment.documentIdsFromDescription.map((documentId: string) =>
          attendees.map(
            (attendee) =>
              attendee.personId &&
              formatSegmentDocumentFromDescription(segment, documentId, attendee.personId),
          ),
        );
      }),
    );

    const flatDescriptions = flatten(flatten(descriptionsToAdd)) as any;

    const tx = this.db.transaction('segmentDocument', 'readwrite');

    const results = await Promise.allSettled(
      driveActivityToAdd.concat(flatDescriptions).map((item) => item?.id && tx.store.put(item)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async getAllForWeek(week: number) {
    const activity = await this.db.getAllFromIndex('segmentDocument', 'by-week', week);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForDay(day: number) {
    const activity = await this.db.getAllFromIndex('segmentDocument', 'by-day', day);
    return orderBy(activity, 'date', 'desc');
  }

  // Transitioned to using this method to get both by id and title together
  async getAllForSegment(segment: ISegment) {
    const activityBySegmentId = await this.db.getAllFromIndex(
      'segmentDocument',
      'by-segment-id',
      segment.id,
    );

    const formattedTitle = formatSegmentTitle(segment.summary);
    let activityByTitle = [] as ISegmentDocument[];
    if (formattedTitle) {
      activityByTitle = await this.db.getAllFromIndex(
        'segmentDocument',
        'by-segment-title',
        formattedTitle,
      );
    }
    return orderBy(uniqBy(activityBySegmentId.concat(activityByTitle), 'id'), 'date', 'desc');
  }

  async getAllForDocumentId(documentId: string) {
    const activity = await this.db.getAllFromIndex('segmentDocument', 'by-document-id', documentId);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForPersonId(personId: string) {
    const activity = await this.db.getAllFromIndex('segmentDocument', 'by-person-id', personId);
    return orderBy(activity, 'date', 'desc');
  }

  async getAllForDriveActivity(activityId: string) {
    const activity = await this.db.getAllFromIndex(
      'segmentDocument',
      'by-drive-activity-id',
      activityId,
    );
    return orderBy(activity, 'date', 'desc');
  }

  async getById(id: string): Promise<ISegmentDocument | undefined> {
    if (id) {
      return this.db.get('segmentDocument', id);
    }
    return undefined;
  }

  async getAll() {
    const activity = await this.db.getAll('segmentDocument');
    return orderBy(activity, 'date', 'desc');
  }
}
