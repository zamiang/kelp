import { IWebsite } from '../data-types';
import { dbType } from '../db';

export default class WebsiteModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async getAll() {
    return this.db.getAll('website');
  }

  async deleteAll(websites: IWebsite[]) {
    const tx = this.db.transaction('website', 'readwrite');
    await Promise.allSettled(websites.map((w) => tx.store.delete(w.id)));
    return tx.done;
  }
}
