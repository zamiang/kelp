import { subDays } from 'date-fns';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IWebsite } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';

interface IWebsiteNotFormatted {
  startAt: Date;
  domain: string;
  pathname: string;
  url: string;
  title?: string;
  isHidden?: boolean;
}

export default class WebsiteModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async getById(id: string): Promise<IWebsite | undefined> {
    return this.db.get('website', id);
  }

  async getAllForSegmentId(segmentId: string) {
    return this.db.getAllFromIndex('website', 'by-segment-id', segmentId);
  }

  async saveToChromeStorage() {
    // TODO: hm
    // const all = await this.db.getAll('website');
    // return chrome.storage.sync.set({ kelpWebsites: JSON.stringify(all) });
  }

  async filterWebsites(
    websites: IWebsite[],
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

    const currentDate = new Date();
    const filterTime = subDays(currentDate, config.NUMBER_OF_DAYS_BACK);
    return websites.filter(
      (item) =>
        !item.isHidden &&
        item.visitedTime > filterTime &&
        !domainBlocklist[item.domain] &&
        !websiteBlocklist[item.url],
    );
  }

  async getAll(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ) {
    const websites = await this.db.getAll('website');
    return this.filterWebsites(websites, domainBlocklistStore, websiteBlocklistStore);
  }

  async addHistoryToStore(websites: IWebsite[]) {
    const tx = this.db.transaction('website', 'readwrite');
    const results = await Promise.allSettled(websites.map((website) => tx.store.put(website)));
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async trackVisit(website: IWebsiteNotFormatted, timeStore: IStore['timeDataStore']) {
    const currentMeeting = await timeStore.getCurrentSegmentForWebsites();
    const result = await this.db.put('website', {
      id: `${website.url}-${website.startAt.toDateString()}`,
      title: website.title || '',
      url: website.url,
      domain: website.domain,
      isHidden: false,
      visitedTime: website.startAt,
      meetingId: currentMeeting ? currentMeeting.id : undefined,
    });

    void this.saveToChromeStorage();
    return result;
  }
}
