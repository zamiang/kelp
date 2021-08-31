import { uniq } from 'lodash';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IChromeWebsite } from '../../fetch/chrome/fetch-history';
import { cleanupUrl } from '../../shared/cleanup-url';
import { cleanText } from '../../shared/tfidf';
import { IWebsiteItem } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';

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

  async getAll(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ) {
    const websites = await this.db.getAll('websiteItem');
    return this.filterWebsites(websites, domainBlocklistStore, websiteBlocklistStore);
  }

  async filterWebsites(
    websites: IWebsiteItem[],
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ) {
    const domainBlocklistArray = await domainBlocklistStore.getAll();
    const websiteBlocklistArray = await websiteBlocklistStore.getAll();
    const domainBlocklist: { [id: string]: boolean } = {};
    const websiteBlocklist: { [id: string]: boolean } = {};

    // Make some hashes
    domainBlocklistArray.forEach((item) => (domainBlocklist[item.id] = true));
    websiteBlocklistArray.forEach((item) => (websiteBlocklist[item.id] = true));

    return websites.filter((item) => !domainBlocklist[item.domain] && !websiteBlocklist[item.id]);
  }

  async addHistoryToStore(websites: IChromeWebsite[]) {
    const tx = this.db.transaction('websiteItem', 'readwrite');
    const formattedWebsites = websites.map((website) => {
      const cleanTitle = cleanText(website.title || '');
      const tags = uniq(cleanTitle).join(' ');
      return {
        id: website.id,
        domain: website.domain,
        title: website.title,
        rawUrl: website.rawUrl,
        tags,
      };
    });

    const results = await Promise.allSettled(
      formattedWebsites.map((website) => tx.store.put(website)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async trackVisit(website: IWebsiteItemNotFormatted) {
    const id = cleanupUrl(website.url);
    const existingItem = await this.getById(id);
    if (existingItem?.userEdited) {
      return this.db.put('websiteItem', {
        id,
        title: website.title || '',
        description: website.description,
        rawUrl: website.url,
        domain: website.domain,
        tags: existingItem.tags, // don't overwrite tags
        ogImage: website.ogImage,
      });
    } else {
      const cleanDescription = cleanText(website.description || '');
      const cleanTitle = cleanText(website.title || '');
      const tags = uniq(cleanTitle.concat(cleanDescription)).join(' ');

      return this.db.put('websiteItem', {
        id,
        title: website.title || '',
        description: website.description,
        rawUrl: website.url,
        domain: website.domain,
        tags,
        ogImage: website.ogImage,
      });
    }
  }

  async updateTags(websiteId: string, tags: string[]) {
    const existingItem = await this.getById(websiteId);
    if (existingItem) {
      return this.db.put('websiteItem', { ...existingItem, tags: tags.join(' ') });
    }
  }
}
