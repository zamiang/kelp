import { getDayOfYear } from 'date-fns';
import { flatten } from 'lodash';
import { IFormattedDriveActivity } from '../../fetch/fetch-drive-activity';
import { getWeek } from '../../shared/date-helpers';
import { dbType } from '../db';
import AttendeeModel from './attendee-model';
import DriveActivityModel from './drive-activity-model';
import SegmentModel, { ISegment } from './segment-model';

export interface ISegmentDocument {
  id: string;
  driveActivityId?: string;
  documentId: string;
  segmentId?: string;
  date: Date;
  reason: string;
  isPersonAttendee?: Boolean;
  personId: string;
  day: number;
  week: number;
}

const formatSegmentDocument = (
  driveActivity: IFormattedDriveActivity,
  segment?: ISegment,
  isPersonAttendee?: boolean,
): ISegmentDocument => ({
  id: driveActivity.id,
  driveActivityId: driveActivity.id,
  documentId: driveActivity.documentId!,
  segmentId: segment?.id,
  date: driveActivity.time,
  reason: driveActivity.action,
  personId: driveActivity.actorPersonId!,
  isPersonAttendee,
  day: getDayOfYear(driveActivity.time),
  week: getWeek(driveActivity.time),
});

const formatSegmentDocumentFromDescription = (
  segment: ISegment,
  documentId: string,
): ISegmentDocument => ({
  id: `${segment.id}-${documentId}`,
  documentId,
  segmentId: segment.id,
  date: segment.start,
  reason: 'Listed in meeting description',
  personId: segment.organizer!.id!,
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
  ) {
    const driveActivity = await driveActivityStore.getAll();
    const segments = await timeStore.getAll();

    // Add drive activity for meetings
    const driveActivityToAdd = await Promise.all(
      driveActivity.map(async (driveActivityItem) => {
        let isActorAttendee = false;
        const segment = segments.find(
          (s) => s.start < driveActivityItem.time && s.end > driveActivityItem.time,
        );
        if (segment) {
          const attendees = await attendeeStore.getAllForSegmentId(segment.id);
          isActorAttendee = !!attendees.find(
            (a) => a.personGoogleId === driveActivityItem.actorPersonId,
          );
        }
        const formattedDocument = formatSegmentDocument(
          driveActivityItem,
          segment,
          isActorAttendee,
        );
        return formattedDocument;
      }),
    );

    // Add drive activity in meeting descriptions
    const descriptionsToAdd = await Promise.all(
      segments.map((segment) =>
        segment.documentIdsFromDescription.map((documentId) =>
          formatSegmentDocumentFromDescription(segment, documentId),
        ),
      ),
    );

    const tx = this.db.transaction('segmentDocument', 'readwrite');
    console.log(driveActivityToAdd, 'about to save segment documents');
    try {
      await Promise.all(driveActivityToAdd.map((item) => item?.id && tx.store.put(item)));
    } catch (e) {
      console.log(e);
    }
    console.log(flatten(descriptionsToAdd), 'about to save description items');
    try {
      await Promise.all(flatten(descriptionsToAdd).map((item) => item?.id && tx.store.put(item)));
    } catch (e) {
      console.log(e);
    }
    return tx.done;
  }

  async getAllForWeek(week: number) {
    return this.db.getAllFromIndex('segmentDocument', 'by-week', week);
  }

  async getAllForDay(day: number) {
    return this.db.getAllFromIndex('segmentDocument', 'by-day', day);
  }

  async getAllForSegmentId(segmentId: string) {
    return this.db.getAllFromIndex('segmentDocument', 'by-segment-id', segmentId);
  }

  async getAllForDocumentId(documentId: string) {
    return this.db.getAllFromIndex('segmentDocument', 'by-document-id', documentId);
  }

  async getAllForPersonId(personId: string) {
    return this.db.getAllFromIndex('segmentDocument', 'by-person-id', personId);
  }

  async getAllForDriveActivity(activityId: string) {
    return this.db.getAllFromIndex('segmentDocument', 'by-drive-activity-id', activityId);
  }

  async getById(id: string): Promise<ISegmentDocument | undefined> {
    if (id) {
      return this.db.get('segmentDocument', id);
    }
    return undefined;
  }

  async getAll() {
    return this.db.getAll('segmentDocument');
  }
}
