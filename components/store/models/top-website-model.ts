import { sortBy } from 'lodash';
import RollbarErrorTracking from '../../error-tracking/rollbar';
import { ITopWebsite } from '../data-types';
import { dbType } from '../db';

export default class TopWebsiteModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up task store');
    this.db = db;
  }

  async addTopWebsitesToStore(topWebsites: ITopWebsite[]) {
    if (topWebsites.length < 1) {
      return;
    }
    const existingTopWebsites = await this.getAllUnfiltered();
    const newTopWebsiteIds = topWebsites.map((t) => t.id);
    const idsToDelete = existingTopWebsites
      .filter(
        (topSite) =>
          !topSite.isCustom && !topSite.isHidden && !newTopWebsiteIds.includes(topSite.id),
      )
      .map((topSite) => topSite.id);

    await Promise.allSettled(idsToDelete.map((id) => this.db.delete('topWebsite', id)));

    const topWebsitesToAdd = topWebsites.map((newSite) => {
      const existingTopSites = existingTopWebsites.filter(
        (existingSite) => existingSite.id === newSite.id,
      );
      if (existingTopSites[0]) {
        return { ...newSite, isHidden: existingTopSites[0].isHidden };
      }
      return newSite;
    });

    const tx = this.db.transaction('topWebsite', 'readwrite');
    // console.log(documents, 'about to save documents');
    const promises = topWebsitesToAdd.map((topSite) => {
      if (topSite?.id) {
        return tx.store.put(topSite);
      }
    });

    const results = await Promise.allSettled(promises);
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        RollbarErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async getById(id: string): Promise<ITopWebsite | undefined> {
    return this.db.get('topWebsite', id);
  }

  async hideById(id: string) {
    const website = await this.db.get('topWebsite', id);
    if (website) {
      (website as any).isHidden = true;
      return this.db.put('topWebsite', website);
    }
  }

  async updateGroup(website: ITopWebsite[]) {
    const tx = this.db.transaction('topWebsite', 'readwrite');
    // console.log(documents, 'about to save documents');
    const promises = website.map((topSite) => {
      if (topSite?.id) {
        return tx.store.put(topSite);
      }
    });

    const results = await Promise.allSettled(promises);
    await tx.done;
    return results;
  }

  async getAll() {
    return sortBy(await this.db.getAll('topWebsite'), 'order')
      .filter((item) => !item.isHidden)
      .sort((a, b) => (a.order > b.order ? 1 : -1));
  }

  async getAllUnfiltered() {
    return await this.db.getAll('topWebsite');
  }

  async addWebsite(url: string, title: string) {
    return this.db.put('topWebsite', {
      id: url,
      title,
      url,
      order: 1,
      isCustom: true,
      isHidden: false,
      // favicon: metadata.image,
    });
  }
}
