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
    return await this.db.getAll('websiteImage');
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
