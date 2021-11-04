import { uniq } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IChromeWebsite } from '../../fetch/chrome/fetch-history';
import { cleanupUrl } from '../../shared/cleanup-url';
import { cleanText } from '../../shared/tfidf';
import { IFeaturedWebsite } from '../../website/get-featured-websites';
import { IWebsite, IWebsiteItem } from '../data-types';
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

  async cleanup() {
    const websites = await this.db.getAll('websiteItem');
    const visits = await this.db.getAll('websiteVisit');

    const websiteIdByLastVisited: { [websiteId: string]: Date } = {};
    visits.forEach((v) => {
      const currentValue = websiteIdByLastVisited[v.websiteId];
      if (currentValue) {
        if (v.visitedTime > currentValue) {
          websiteIdByLastVisited[v.websiteId] = v.visitedTime;
        }
      } else {
        websiteIdByLastVisited[v.websiteId] = v.visitedTime;
      }
    });
    const websiteIdsToDelete = websites.filter((w) => {
      const lastVisited = websiteIdByLastVisited[w.id];
      if (!lastVisited || lastVisited < config.startDate) {
        return true;
      }
      return false;
    });

    const tx = this.db.transaction('websiteItem', 'readwrite');
    const results = await Promise.allSettled(
      websiteIdsToDelete.map((website) => tx.store.delete(website.id)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
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

    const tx = this.db.transaction('websiteItem', 'readwrite');
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

  async addOldWebsites(websites: IWebsite[]) {
    const formattedWebsites = websites.map((website): IWebsiteItem => {
      const title = website.cleanTitle?.split(' ') || [];
      const desc = website.cleanDescription?.split(' ') || [];
      const tags = uniq(title.concat(desc)).join(' ');

      return {
        id: website.url,
        domain: website.domain,
        title: website.title,
        description: website.description,
        documentId: website.documentId,
        rawUrl: website.rawUrl,
        tags,
        ogImage: website.ogImage,
      };
    });

    const tx = this.db.transaction('websiteItem', 'readwrite');

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
      // only overwrite title, description, ogimage
      const w = {
        ...existingItem,
        title: website.title || '',
        description: website.description,
        rawUrl: website.url,
        ogImage: website.ogImage,
      };
      await this.db.put('websiteItem', w);
      return w;
    } else {
      const cleanDescription = cleanText(website.description || '');
      const cleanTitle = cleanText(website.title || '');
      const tags = uniq(cleanTitle.concat(cleanDescription)).join(' ');

      const w = {
        id,
        title: website.title || '',
        description: website.description,
        rawUrl: website.url,
        domain: website.domain,
        tags,
        ogImage: website.ogImage,
      };
      await this.db.put('websiteItem', w);
      return w;
    }
  }

  async updateTags(websiteId: string, tags: string) {
    const existingItem = await this.getById(websiteId);
    if (existingItem) {
      const website = { ...existingItem, tags, userEdited: true };
      await this.db.put('websiteItem', website);
      return website;
    }
  }

  async saveOrder(websiteItems: IFeaturedWebsite[]) {
    const results = await Promise.allSettled(
      websiteItems.map(async (featuredWebsite, index) => {
        const existingItem = await this.getById(featuredWebsite.id);
        if (existingItem) {
          const website = { ...existingItem, index, userEdited: true };
          await this.db.put('websiteItem', website);
          return website;
        }
      }),
    );

    return results;
  }

  async moveToFront(websiteId: string) {
    const existingItem = await this.getById(websiteId);
    if (existingItem) {
      const website = { ...existingItem, index: 0, userEdited: true };
      await this.db.put('websiteItem', website);
      return website;
    }
  }
}
