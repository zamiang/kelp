import { dbType } from '../db';

export default class SegmentTagModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website pin store');
    this.db = db;
  }

  async create(tag: string, segmentId: string, segmentSummary: string) {
    const result = await this.db.put('segmentTag', {
      id: `${segmentId}-${tag}`,
      tag: tag.toLocaleLowerCase(),
      segmentId,
      segmentSummary,
      createdAt: new Date(),
    });
    return result;
  }

  async delete(tag: string, segmentId: string) {
    return await this.db.delete('segmentTag', `${segmentId}-${tag}`);
  }

  async deleteAllForTag(tag: string) {
    const tags = await this.db.getAllFromIndex('segmentTag', 'by-tag', tag);
    return await Promise.all(tags.map((t) => this.db.delete('segmentTag', t.id)));
  }

  async getAll() {
    const websiteTags = await this.db.getAll('segmentTag');
    return websiteTags;
  }
}
