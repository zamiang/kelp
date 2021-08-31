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
}
