import { IFormattedDriveActivity } from '../fetch/fetch-first';

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
    console.warn('setting up email store');
    this.driveActivityById = {};
    this.driveActivityByDocumentId = {};

    this.addDriveActivityToStore(driveActivity);
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    driveActivity.forEach((driveActivityItem) => {
      this.driveActivityById[driveActivityItem.id] = driveActivityItem;
      if (driveActivityItem.link) {
        if (this.driveActivityByDocumentId[driveActivityItem.link]) {
          this.driveActivityByDocumentId[driveActivityItem.link].push(driveActivityItem);
        } else {
          this.driveActivityByDocumentId[driveActivityItem.link] = [driveActivityItem];
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

  getLength() {
    return Object.keys(this.driveActivityById).length;
  }
}
