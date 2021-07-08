import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IWebsiteImage } from '../data-types';
import { dbType } from '../db';

export default class WebsiteImageModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async getById(id: string): Promise<IWebsiteImage | undefined> {
    return this.db.get('websiteImage', id);
  }

  async saveToChromeStorage() {
    // TODO reenable
    // const all = await this.db.getAll('websiteImage');
    // chrome.storage.sync.set({ kelpWebsiteImages: JSON.stringify(all) });
  }

  async getAll() {
    const results = await this.db.getAll('websiteImage');
    return results;
  }

  async cleanupWebsiteImages(images: IWebsiteImage[]) {
    const imagesToDelete = images.filter((image) => image.date < config.startDate);
    const tx = this.db.transaction('websiteImage', 'readwrite');
    const results = await Promise.allSettled(
      imagesToDelete.map((item) => this.db.delete('websiteImage', item.id)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async saveWebsiteImage(url: string, image: string, date: Date) {
    if (!image) {
      return;
    }
    const result = await this.db.put('websiteImage', {
      id: url,
      image,
      date,
    });

    void this.saveToChromeStorage();
    return result;
  }
}
