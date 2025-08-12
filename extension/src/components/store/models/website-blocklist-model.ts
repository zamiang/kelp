import { dbType } from '../db';

export default class WebsiteBlocklistModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website blocklist store');
    this.db = db;
  }

  async getAll() {
    return this.db.getAll('websiteBlocklist');
  }

  async addWebsite(url: string) {
    return this.db.put('websiteBlocklist', {
      id: url,
      createdAt: new Date(),
    });
  }

  async removeWebsite(url: string) {
    return this.db.delete('websiteBlocklist', url);
  }
}
