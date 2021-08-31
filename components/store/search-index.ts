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
    this.results = [];
  }

  async addData(store: IStore) {
    const searchIndex = [] as ISearchItem[];
    // Docs
    const documents = await store.documentDataStore.getAll();
    documents?.map((document) => {
      if (document?.name) {
        searchIndex.push({
          text: document.name.toLowerCase(),
          type: 'website',
          item: documentToWebsite(document),
        });
      }
    });

    // Meetings
    const segments = await store.timeDataStore.getAll();
    segments.map((segment) => {
      if (segment?.summary) {
        searchIndex.push({
          text: segment.summary.toLowerCase(),
          type: 'segment',
          item: segment,
        });
      }
    });

    // People
    const people = await store.personDataStore.getAll(false);
    people.map((person) => {
      if (person?.name?.toLowerCase().indexOf('unknown contributor') < 0) {
        searchIndex.push({
          text: person.name.toLowerCase(),
          type: 'person',
          item: person,
        });
      }
    });

    // Websites
    const websites = await store.websiteStore.getAll(
      store.domainBlocklistStore,
      store.websiteBlocklistStore,
    );
    websites.map((website) => {
      searchIndex.push({
        text: website.title.toLowerCase(),
        type: 'website',
        item: website,
      });
    });

    this.results = searchIndex;
  }
}
