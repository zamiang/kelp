import { orderBy, uniqBy } from 'lodash';
import { IWebsiteTag } from '../data-types';
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
      order: 0,
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

  async updateWebsiteTags(websiteTags: IWebsiteTag[]) {
    websiteTags.map((t, index) => (t.order = index));
    return await Promise.all(websiteTags.map((t) => this.db.put('websiteTag', t)));
  }

  async getAll() {
    const websiteTags = await this.db.getAll('websiteTag');
    return orderBy(uniqBy(websiteTags, 'tag'), ['order', 'tag']);
  }
}
