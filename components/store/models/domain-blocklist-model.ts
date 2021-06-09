import { dbType } from '../db';

export default class DomainBlocklistModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up domain blocklist store');
    this.db = db;
  }

  async getAll() {
    return this.db.getAll('domainBlocklist');
  }

  async addWebsite(url: string) {
    return this.db.put('domainBlocklist', {
      id: url,
      createdAt: new Date(),
    });
  }

  async removeWebsite(url: string) {
    return this.db.delete('domainBlocklist', url);
  }
}
