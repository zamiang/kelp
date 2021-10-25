import Tfidf from '../../shared/tfidf';
import { IWebsite } from '../data-types';
import { IStore } from '../use-store';

/**
 * Used so that a person's unique first+last name combo makes it through TFIDF and common first or last names are not misrepresented
 */
export const uncommonPunctuation = 'æ';

interface ITfidfRow {
  id: string;
  key: string;
  text: string;
}

export interface ITfidfTag {
  term: string;
  tfidf: number;
}

export default class TfidfStore {
  // not sure this caching is a good idea. I don't want to store it and it won't change much during a pageload
  async getTfidf(store: IStore) {
    const data = await this.getDocuments(store);
    if ((window as any).tfidf) {
      return (window as any).tfidf as Tfidf;
    }
    const tfidf = new Tfidf(data);
    (window as any).tfidf = tfidf;
    return tfidf;
  }

  async getTfidfForDocuments(data: ITfidfRow[]) {
    return new Tfidf(data);
  }

  getCalculatedDocuments() {
    return (window as any).tfidf?.listTerms() as string[];
  }

  getDocumentsForWebsites(websites: IWebsite[]) {
    const websiteTitles = websites.map(
      (website) => `${website.title || ''} ${website.description || ''}`,
    );
    return websiteTitles.map((item) => ({
      id: `websites-${item}`,
      key: item,
      type: 'website' as any,
      text: item,
    }));
  }

  async getDocuments(store: IStore) {
    // Websites
    const websitesList = await store.websiteStore.getAll(
      store.domainBlocklistStore,
      store.websiteBlocklistStore,
    );
    const websiteTitles = websitesList.map(
      (website) => `${website.title || ''} ${website.description || ''}`,
    );

    // Meetings
    const segments = await store.timeDataStore.getAll();
    const meetingTitles = segments.map((segment) => segment.summary);

    // Formatting
    const websiteItems = websiteTitles.map((item) => ({
      id: `websites-${item}`,
      key: item,
      type: 'website' as any,
      text: item,
    }));
    const meetingItems = meetingTitles.map((item) => ({
      id: `meetings-${item}`,
      key: item!,
      type: 'meetings' as any,
      text: item!,
    }));

    return websiteItems.concat(meetingItems);
  }
}
