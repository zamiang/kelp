import { IFormattedDriveActivity } from '../fetch/fetch-first';

interface driveActivityById {
  [id: string]: IFormattedDriveActivity;
}

export default class DriveActivityDataStore {
  private driveActivityById: driveActivityById;

  constructor(driveActivity: IFormattedDriveActivity[]) {
    console.warn('setting up email store');
    this.driveActivityById = {};

    this.addDriveActivityToStore(driveActivity);
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    driveActivity.forEach((driveActivityItem) => {
      this.driveActivityById[driveActivityItem.id] = driveActivityItem;
    });
  }

  getById(id: string) {
    return this.driveActivityById[id];
  }

  getLength() {
    return Object.keys(this.driveActivityById).length;
  }
}
