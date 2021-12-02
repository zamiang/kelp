import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { cleanupUrl } from '../../shared/cleanup-url';
import { IWebsiteImage } from '../data-types';
import { dbType } from '../db';

export default class WebsiteImageModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async getById(id: string): Promise<IWebsiteImage | undefined> {
    return this.db.get('websiteImage', id);
  }

  async getAll() {
    const results = await this.db.getAll('websiteImage');
    return results;
  }

  async cleanup() {
    const images = await this.getAll();
    const imagesToDelete = images.filter((image) => !image.date || image.date < config.startDate);
    const tx = this.db.transaction('websiteImage', 'readwrite');
    const results = await Promise.allSettled(
      imagesToDelete.map((item) => tx.store.delete(item.id)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logError(result.reason);
      }
    });
    return;
  }

  async saveWebsiteImage(url: string, image: string, date: Date) {
    if (!image) {
      return;
    }
    const result = await this.db.put('websiteImage', {
      id: cleanupUrl(url),
      rawUrl: url,
      image,
      date,
    });

    return result;
  }
}
