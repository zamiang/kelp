import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { getGoogleDocsIdFromLink } from './document-store';

interface driveActivityById {
  [id: string]: IFormattedDriveActivity;
}

interface driveActivityByDocumentId {
  [id: string]: [IFormattedDriveActivity];
}

export default class DriveActivityDataStore {
  private driveActivityById: driveActivityById;
  private driveActivityByDocumentId: driveActivityByDocumentId;

  constructor(driveActivity: IFormattedDriveActivity[]) {
    // console.warn('setting up drive activity store');
    this.driveActivityById = {};
    this.driveActivityByDocumentId = {};

    this.addDriveActivityToStore(driveActivity);
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    driveActivity.forEach((driveActivityItem) => {
      this.driveActivityById[driveActivityItem.id] = driveActivityItem;
      if (driveActivityItem.link) {
        const id = getGoogleDocsIdFromLink(driveActivityItem.link);
        if (this.driveActivityByDocumentId[id]) {
          this.driveActivityByDocumentId[id].push(driveActivityItem);
        } else {
          this.driveActivityByDocumentId[id] = [driveActivityItem];
        }
      }
    });
  }

  getDriveActivityForDocument(documentId: string) {
    return this.driveActivityByDocumentId[documentId];
  }

  getById(id: string): IFormattedDriveActivity | undefined {
    return this.driveActivityById[id];
  }

  getAll() {
    return Object.values(this.driveActivityById);
  }

  getLength() {
    return Object.keys(this.driveActivityById).length;
  }
}
