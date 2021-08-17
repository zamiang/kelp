import Tfidf from '../../shared/tfidf';
import { dbType } from '../db';
import { IStore } from '../use-store';

/**
 * Used so that a person's unique first+last name combo makes it through TFIDF and common first or last names are not misrepresented
 */
export const uncommonPunctuation = 'æ';

export interface ITfidfRow {
  id: string;
  key: string;
  text: string;
}

export default class TfidfStore {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async getTfidf() {
    const data = await this.getDocuments();
    const tfidf = new Tfidf(data);
    return tfidf;
  }

  async saveDocuments(store: IStore) {
    // Websites
    const websitesList = await store.websitesStore.getAll(
      store.domainBlocklistStore,
      store.websiteBlocklistStore,
    );
    const websiteTitles = websitesList.map(
      (website) =>
        // TODO: Use website description
        website.title || '',
    );

    // Meetings
    const segments = await store.timeDataStore.getAll();
    const meetingTitles = segments.map((segment) => segment.summary);

    // Formatting
    const websiteItems = Object.keys(websiteTitles)
      .map((key) => ({
        key,
        text: key,
      }))
      .map((item) => ({
        id: `websites-${item.key}`,
        key: item.key,
        type: 'website' as any,
        text: item.text,
      }));
    const meetingItems = Object.keys(meetingTitles)
      .map((key) => ({
        key,
        text: key,
      }))
      .map((item) => ({
        id: `meetings-${item.key}`,
        key: item.key,
        type: 'meetings' as any,
        text: item.text,
      }));

    const tx = this.db.transaction('tfidf', 'readwrite');
    // console.log(documentItems, 'about to save documentitems tfidf');
    await Promise.all(websiteItems.map(async (item) => tx.store.put(item)));
    // console.log(meetingItems, 'about to save meetingitems tfidf');
    await Promise.all(meetingItems.map(async (item) => tx.store.put(item)));
    return tx.done;
  }

  async getDocuments() {
    const results = await this.db.getAllFromIndex('tfidf', 'by-type');
    return results;
  }
}
