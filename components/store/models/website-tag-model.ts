import { dbType } from '../db';

export default class WebsiteTagModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website pin store');
    this.db = db;
  }

  async create(tag: string, websiteId: string) {
    const result = await this.db.put('websiteTag', {
      id: `${websiteId}-${tag}`,
      tag: tag.toLocaleLowerCase(),
      url: websiteId,
      createdAt: new Date(),
    });
    return result;
  }

  async delete(tag: string, websiteId: string) {
    return await this.db.delete('websiteTag', `${websiteId}-${tag}`);
  }

  async getAll() {
    const websiteTags = await this.db.getAll('websiteTag');
    return websiteTags;
  }
}
