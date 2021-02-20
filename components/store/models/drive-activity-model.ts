import { IFormattedDriveActivity } from '../../fetch/fetch-drive-activity';
import { dbType } from '../db';
import { getGoogleDocsIdFromLink } from './document-model';

const formatDriveActivity = (driveActivity: IFormattedDriveActivity) => {
  const documentId = getGoogleDocsIdFromLink(driveActivity.link);
  return { ...driveActivity, documentId };
};

export default class DriveActivityModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    const tx = this.db.transaction('driveActivity', 'readwrite');
    await Promise.all(
      driveActivity.map((driveActivityItem) => {
        const formattedItem = formatDriveActivity(driveActivityItem);
        if (formattedItem.id) {
          return tx.store.put(formattedItem);
        }
      }),
    );
    return tx.done;
  }

  async getDriveActivityForDocument(documentId: string) {
    return this.db.getAllFromIndex('driveActivity', 'by-document-id', documentId);
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
