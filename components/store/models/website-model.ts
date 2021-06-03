import { IWebsite } from '../data-types';
import { dbType } from '../db';
import { IStore } from '../use-store';

interface IWebsiteNotFormatted {
  startAt: Date;
  domain: string;
  pathname: string;
  url: string;
  title?: string;
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

  async saveToChromeStorage() {
    const all = await this.db.getAll('website');
    return chrome.storage.sync.set({ kelpWebsites: JSON.stringify(all) });
  }

  async getAll() {
    return await this.db.getAll('website');
  }

  async addHistoryToStore(data: any) {
    console.log(data, 'trying to add to the website store');
  }

  async trackVisit(
    website: IWebsiteNotFormatted,
    timeStore: IStore['timeDataStore'],
    websiteImageStore: IStore['websiteImageStore'],
  ) {
    const currentMeeting = await timeStore.getCurrentSegment();

    chrome.tabs.captureVisibleTab(
      null as any,
      {
        format: 'jpeg',
        quality: 50,
      },
      (image) => {
        void websiteImageStore.saveWebsiteImage(website.url, image, website.startAt);
        console.log(image);
      },
    );

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
