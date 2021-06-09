import { dbType } from '../db';

export default class DomainFilterModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up domain filter store');
    this.db = db;
  }

  async getAll() {
    return this.db.getAll('domainFilter');
  }

  async addFilter(domain: string) {
    return this.db.put('domainFilter', {
      id: domain,
      createdAt: new Date(),
      order: 0,
    });
  }

  async removeFilter(domain: string) {
    return this.db.delete('domainFilter', domain);
  }
}
