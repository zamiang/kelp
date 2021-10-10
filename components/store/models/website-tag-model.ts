import { uniqBy } from 'lodash';
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

  async deleteAllForTag(tag: string) {
    const tags = await this.db.getAllFromIndex('websiteTag', 'by-tag', tag);
    return await Promise.all(tags.map((t) => this.db.delete('websiteTag', t.id)));
  }

  async getAll() {
    const websiteTags = await this.db.getAll('websiteTag');
    return uniqBy(websiteTags, 'tag');
  }
}
