import { IWebsite } from '../data-types';
import { dbType } from '../db';

interface IWebsiteNotFormatted {
  startAt: Date;
  domain: string;
  pathname: string;
  url: string;
  title?: string;
}

export default class WebsiteModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async getById(id: string): Promise<IWebsite | undefined> {
    return this.db.get('website', id);
  }

  async saveToChromeStorage() {
    const all = await this.db.getAll('website');
    return chrome.storage.sync.set({ kelpWebsites: JSON.stringify(all) });
  }

  async getAll() {
    return await this.db.getAll('website');
  }

  async addHistoryToStore(data: any) {
    console.log(data, 'trying to add to the website store');
  }

  async trackVisit(website: IWebsiteNotFormatted) {
    const result = await this.db.put('website', {
      id: `${website.url}-${website.startAt.toDateString()}`,
      title: website.title || '',
      url: website.url,
      domain: website.domain,
      isHidden: false,
      visitedTime: website.startAt,
    });

    void this.saveToChromeStorage();
    return result;
  }
}
