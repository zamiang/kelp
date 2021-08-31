import { uniq } from 'lodash';
import ErrorTracking from '../../error-tracking/error-tracking';
import { cleanupUrl } from '../../shared/cleanup-url';
import { cleanText } from '../../shared/tfidf';
import { IWebsiteItem } from '../data-types';
import { dbType } from '../db';

interface IWebsiteItemNotFormatted {
  domain: string;
  pathname: string;
  url: string;
  title?: string;
  description?: string;
  ogImage?: string;
}

export default class WebsiteItemModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async getById(id: string): Promise<IWebsiteItem | undefined> {
    return this.db.get('websiteItem', id);
  }

  async addHistoryToStore(websites: IWebsiteItem[]) {
    const tx = this.db.transaction('websiteItem', 'readwrite');
    const results = await Promise.allSettled(websites.map((website) => tx.store.put(website)));
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async trackVisit(website: IWebsiteItemNotFormatted) {
    const cleanDescription = cleanText(website.description || '');
    const cleanTitle = cleanText(website.title || '');
    const tags = uniq(cleanTitle.concat(cleanDescription)).join(' ');

    const id = cleanupUrl(website.url);
    const result = await this.db.put('websiteItem', {
      id,
      title: website.title || '',
      description: website.description,
      rawUrl: website.url,
      domain: website.domain,
      tags,
      ogImage: website.ogImage,
    });

    return result;
  }

  async updateTags(website: string, tags: string[]) {
    console.log(website, tags);
  }
}
