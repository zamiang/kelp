import { IDocument, IPerson, ISegment } from './data-types';
import { IStore } from './use-store';

export interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person';
  item: IPerson | ISegment | IDocument;
}

export default class SearchIndex {
  results: ISearchItem[];

  constructor() {
    this.results = [];
  }

  async addData(store: {
    documentDataStore: IStore['documentDataStore'];
    driveActivityStore: IStore['driveActivityStore'];
    timeDataStore: IStore['timeDataStore'];
    personDataStore: IStore['personDataStore'];
  }) {
    const searchIndex = [] as ISearchItem[];
    // Docs
    const documents = await store.documentDataStore.getAll();
    documents?.map((document) => {
      if (document?.name) {
        searchIndex.push({
          text: document.name.toLowerCase(),
          type: 'document',
          item: document,
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

    this.results = searchIndex;
  }
}
