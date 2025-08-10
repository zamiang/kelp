import { IDocument, IPerson, ISegment, IWebsiteItem } from './data-types';
import { IStore } from './use-store';

export interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person' | 'website';
  item: IPerson | ISegment | IDocument | IWebsiteItem;
}

const documentToWebsite = (document: IDocument): IWebsiteItem => ({
  id: document.link!,
  title: document.name!,
  rawUrl: document.link!,
  documentId: document.id,
  domain: document.link!,
});

export default class SearchIndex {
  results: ISearchItem[];

  constructor() {
    console.log('setting up search index');
    this.results = [];
  }

  async addData(store: IStore) {
    const searchIndex = [] as ISearchItem[];

    const [documents, segments, people, websitesResult] = await Promise.all([
      store.documentDataStore.getAll(),
      store.timeDataStore.getAll(),
      store.personDataStore.getAll(false),
      store.websiteStore.getAllFiltered(store.domainBlocklistStore, store.websiteBlocklistStore),
    ]);

    const websites = websitesResult.success ? websitesResult.data.data : [];

    // Docs
    documents?.forEach((document) => {
      if (document?.name) {
        searchIndex.push({
          text: document.name.toLowerCase(),
          type: 'website',
          item: documentToWebsite(document),
        });
      }
    });

    // Meetings
    segments.forEach((segment) => {
      if (segment?.summary) {
        searchIndex.push({
          text: segment.summary.toLowerCase(),
          type: 'segment',
          item: segment,
        });
      }
    });

    // People
    people.forEach((person) => {
      if (person?.name?.toLowerCase().indexOf('unknown contributor') < 0) {
        searchIndex.push({
          text: person.name.toLowerCase(),
          type: 'person',
          item: person,
        });
      }
    });

    // Websites
    websites.forEach((website) => {
      searchIndex.push({
        text: website.title.toLowerCase(),
        type: 'website',
        item: website,
      });
    });

    this.results = searchIndex;
  }
}
