import { dbType } from '../db';

export default class WebsitePinModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website pin store');
    this.db = db;
  }

  async create(websiteId: string) {
    const result = await this.db.put('websitePin', {
      id: websiteId,
      createdAt: new Date(),
    });
    return result;
  }

  async delete(websiteId: string) {
    return await this.db.delete('websitePin', websiteId);
  }

  async getAll() {
    const websitePins = await this.db.getAll('websitePin');
    return websitePins;
  }
}
