import { dbType } from '../db';
import { IStore } from '../use-store';

export default class WebsitePinModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async create(websiteId: string) {
    foo = bar;
    return;
  }

  async getAll(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ) {
    const websites = await this.db.getAll('website');
    return this.filterWebsites(websites, domainBlocklistStore, websiteBlocklistStore);
  }
}
