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
      const result = await this.db.put('topWebsite', website);
      void this.saveToChromeStorage();
      return result;
    }
  }

  async saveToChromeStorage() {
    const all = await this.db.getAll('topWebsite');
    return chrome.storage.sync.set({ kelpTopWebsites: JSON.stringify(all) });
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

  async getAllUnfiltered(): Promise<ITopWebsite[]> {
    return new Promise((resolve, reject) => {
      // Asynchronously fetch all data from storage.sync.
      if (chrome.storage) {
        chrome.storage.sync.get('kelpTopWebsites', (items) => {
          // Pass any observed errors down the promise chain.
          if (chrome.runtime.lastError) {
            return reject(chrome.runtime.lastError);
          }
          // Pass the data retrieved from storage down the promise chain.
          if (items && items.kelpTopWebsites) {
            resolve(JSON.parse(items.kelpTopWebsites));
          } else {
            resolve(this.db.getAll('topWebsite'));
          }
        });
      } else {
        resolve(this.db.getAll('topWebsite'));
      }
    });
  }

  async addWebsite(url: string, title: string) {
    const result = await this.db.put('topWebsite', {
      id: url,
      title,
      url,
      order: 1,
      isCustom: true,
      isHidden: false,
      // favicon: metadata.image,
    });
    void this.saveToChromeStorage();
    return result;
  }
}
