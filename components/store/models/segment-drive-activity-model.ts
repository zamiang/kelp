import { IFormattedDriveActivity } from '../../fetch/fetch-drive-activity';
import { dbType } from '../db';
import { ISegment } from './segment-model';

export interface ISegmentDriveActivity {
  id: string;
  driveActivityId: string;
  documentId: string;
  segmentId: string;
}

const formatSegmentDriveActivity = (driveActivity: IFormattedDriveActivity, segment: ISegment) => ({
  id: `${segment.id}-${driveActivity.id}`,
  driveActivityId: driveActivity.id,
  documentId: driveActivity.documentId!,
  segmentId: segment.id,
});

export default class SegmentDriveActivityModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addSegmentDriveActivityToStore(
    driveActivity: IFormattedDriveActivity[],
    segments: ISegment[],
  ) {
    const tx = this.db.transaction('meetingDriveActivity', 'readwrite');
    await Promise.all(
      driveActivity.map((driveActivityItem) =>
        tx.store.put(formatSegmentDriveActivity(driveActivityItem, segments[0])),
      ),
    );
    return tx.done;
  }

  async getForSegmentId(segmentId: string) {
    return this.db.getAllFromIndex('meetingDriveActivity', 'by-segment-id', segmentId);
  }

  async getForDocumentId(documentId: string) {
    return this.db.getAllFromIndex('meetingDriveActivity', 'by-document-id', documentId);
  }

  async getForDriveActivity(activityId: string) {
    return this.db.getAllFromIndex('meetingDriveActivity', 'by-drive-activity-id', activityId);
  }

  async getById(id: string): Promise<ISegmentDriveActivity | undefined> {
    if (id) {
      return this.db.get('meetingDriveActivity', id);
    }
    return undefined;
  }

  async getAll() {
    return this.db.getAll('meetingDriveActivity');
  }
}
