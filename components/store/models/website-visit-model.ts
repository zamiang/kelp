import { isSameDay, subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { IChromeWebsite } from '../../fetch/chrome/fetch-history';
import { cleanupUrl } from '../../shared/cleanup-url';
import { ISegment, IWebsite, IWebsiteVisit } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';
import { formatSegmentTitle } from './segment-document-model';

interface IWebsiteVisitNotFormatted {
  startAt: Date;
  url: string;
  domain: string;
}

export default class WebsiteVisitModel {
  private db: dbType;

  constructor(db: dbType) {
    // console.warn('setting up website store');
    this.db = db;
  }

  async getById(id: string): Promise<IWebsiteVisit | undefined> {
    return this.db.get('websiteVisit', id);
  }

  async getAllForSegment(
    segment: ISegment,
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ) {
    const websitesById = await this.db.getAllFromIndex('websiteVisit', 'by-segment-id', segment.id);
    let websitesByTitle = [] as IWebsiteVisit[];
    const formattedTitle = formatSegmentTitle(segment.summary);

    if (formattedTitle) {
      websitesByTitle = await this.db.getAllFromIndex(
        'websiteVisit',
        'by-segment-title',
        formattedTitle,
      );
    }
    const websites = uniqBy(websitesByTitle.concat(websitesById), 'id');
    return await this.filterWebsites(websites, domainBlocklistStore, websiteBlocklistStore);
  }

  async filterWebsites(
    websites: IWebsiteVisit[],
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
        item.visitedTime > filterTime &&
        !domainBlocklist[item.domain] &&
        !websiteBlocklist[item.url],
    );
  }

  async getAll(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
  ) {
    const websites = await this.db.getAll('websiteVisit');
    return this.filterWebsites(websites, domainBlocklistStore, websiteBlocklistStore);
  }

  async getAllForDay(
    domainBlocklistStore: IStore['domainBlocklistStore'],
    websiteBlocklistStore: IStore['websiteBlocklistStore'],
    day: Date,
  ) {
    const websites = await this.getAll(domainBlocklistStore, websiteBlocklistStore);
    return websites.filter((w) => isSameDay(w.visitedTime, day));
  }

  async cleanup() {
    const websites = await this.db.getAll('websiteVisit');
    const websitesToDelete = websites.filter(
      (site) => !site.visitedTime || site.visitedTime < config.startDate,
    );
    const tx = this.db.transaction('websiteVisit', 'readwrite');
    const results = await Promise.allSettled(
      websitesToDelete.map((item) => tx.store.delete(item.id)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logError(result.reason);
      }
    });
    return;
  }

  async addHistoryToStore(websites: IChromeWebsite[], timeStore: IStore['timeDataStore']) {
    const formattedWebsites = await Promise.allSettled(
      websites.map(async (website): Promise<IWebsiteVisit> => {
        const currentMeeting = await timeStore.getCurrentSegmentForWebsites(
          website.visitedTime || new Date(),
        );
        return {
          id: `${website.id}-${website.visitedTime.toDateString()}`,
          websiteId: website.id,
          url: website.rawUrl,
          domain: website.domain,
          visitedTime: website.visitedTime,
          segmentId: currentMeeting ? currentMeeting.id : undefined,
          segmentName: currentMeeting ? formatSegmentTitle(currentMeeting.summary) : undefined,
        };
      }),
    );
    const tx = this.db.transaction('websiteVisit', 'readwrite');
    const results = await Promise.allSettled(
      formattedWebsites.map((website) => {
        if (website.status === 'fulfilled') {
          return tx.store.put(website.value as any);
        }
      }),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logError(result.reason);
      }
    });
    return;
  }

  async addOldWebsites(websites: IWebsite[]) {
    const formattedWebsites = websites.map(
      (website): IWebsiteVisit => ({
        id: website.id,
        domain: website.domain,
        websiteId: website.url,
        segmentId: website.meetingId,
        segmentName: website.meetingName,
        url: website.rawUrl,
        visitedTime: website.visitedTime,
      }),
    );

    const tx = this.db.transaction('websiteVisit', 'readwrite');

    const results = await Promise.allSettled(
      formattedWebsites.map((website) => tx.store.put(website)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logError(result.reason);
      }
    });
    return;
  }

  async trackVisit(website: IWebsiteVisitNotFormatted, timeStore: IStore['timeDataStore']) {
    const currentMeeting = await timeStore.getCurrentSegmentForWebsites(
      website.startAt || new Date(),
    );
    const websiteId = cleanupUrl(website.url);
    const result = await this.db.put('websiteVisit', {
      id: `${website.url}-${website.startAt.toDateString()}`,
      websiteId,
      url: website.url,
      domain: website.domain,
      visitedTime: website.startAt,
      segmentId: currentMeeting ? currentMeeting.id : undefined,
      segmentName: currentMeeting ? formatSegmentTitle(currentMeeting.summary) : undefined,
    });

    return result;
  }
}
