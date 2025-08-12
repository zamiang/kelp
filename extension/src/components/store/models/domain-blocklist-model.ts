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

  async addDomain(domain: string) {
    return this.db.put('domainBlocklist', {
      id: domain,
      createdAt: new Date(),
    });
  }

  async removeDomain(url: string) {
    return this.db.delete('domainBlocklist', url);
  }
}
