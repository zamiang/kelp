import { orderBy } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { IFormattedDriveActivity } from '../data-types';
import { dbType } from '../db';
import { getIdFromLink } from './document-model';

const formatDriveActivity = (driveActivity: IFormattedDriveActivity, currentUserId: string) => {
  const documentId = getIdFromLink(driveActivity.link);
  const isCurrentUser: number = driveActivity.actorPersonId === currentUserId ? 1 : 0;
  return { ...driveActivity, documentId, isCurrentUser };
};

export default class DriveActivityModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addDriveActivityToStore(driveActivity: IFormattedDriveActivity[], currentUserId: string) {
    const formattedActivity = driveActivity.map((driveActivityItem) => {
      const formattedItem = formatDriveActivity(driveActivityItem, currentUserId);
      if (formattedItem.id) {
        return formattedItem;
      }
    });

    const tx = this.db.transaction('driveActivity', 'readwrite');
    const results = await Promise.allSettled(
      formattedActivity.map((item) => item && tx.store.put(item)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    console.log(driveActivity, '<<<<<<<');
    return;
  }

  async getDriveActivityForDocument(documentId: string) {
    return this.db.getAllFromIndex('driveActivity', 'by-document-id', documentId);
  }

  async getCurrentUserDriveActivity() {
    const activity = await this.db.getAllFromIndex('driveActivity', 'is-self', 1 as any);
    return orderBy(activity, 'date', 'desc');
  }

  async getById(id: string): Promise<IFormattedDriveActivity | undefined> {
    if (id) {
      return this.db.get('driveActivity', id);
    }
    return undefined;
  }

  async getAll() {
    return this.db.getAll('driveActivity');
  }
}
