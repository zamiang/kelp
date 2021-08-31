import { subDays } from 'date-fns';
import { uniqBy } from 'lodash';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
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

  async cleanupWebsites() {
    const websites = await this.db.getAll('websiteVisit');
    const websitesToDelete = websites.filter((site) => site.visitedTime < config.startDate);
    const tx = this.db.transaction('websiteVisit', 'readwrite');
    const results = await Promise.allSettled(
      websitesToDelete.map((item) => this.db.delete('websiteVisit', item.id)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async addHistoryToStore(websites: IWebsite[], timeStore: IStore['timeDataStore']) {
    const tx = this.db.transaction('websiteVisit', 'readwrite');
    const results = await Promise.allSettled(
      websites.map(async (website) => {
        const websiteId = cleanupUrl(website.url);
        const currentMeeting = await timeStore.getCurrentSegmentForWebsites(
          website.visitedTime || new Date(),
        );
        const formatted = {
          id: `${website.url}-${website.visitedTime.toDateString()}`,
          websiteId,
          url: website.url,
          domain: website.domain,
          visitedTime: website.visitedTime,
          meetingId: currentMeeting ? currentMeeting.id : undefined,
          meetingName: currentMeeting ? formatSegmentTitle(currentMeeting.summary) : undefined,
        };
        await tx.store.put(formatted);
      }),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
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
      meetingId: currentMeeting ? currentMeeting.id : undefined,
      meetingName: currentMeeting ? formatSegmentTitle(currentMeeting.summary) : undefined,
    });

    return result;
  }
}
