import { IDocument } from './models/document-model';
import { IPerson } from './models/person-model';
import { ISegment } from './models/segment-model';
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
    documents.map((doc) => {
      if (doc && doc.name) {
        searchIndex.push({
          text: doc.name.toLowerCase(),
          type: 'document',
          item: doc,
        });
      }
    });
    // Meetings
    const segments = await store.timeDataStore.getAll();
    segments.map((segment) => {
      if (segment.summary) {
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
      if (person && person.name.indexOf('person') < 0 && person.name.indexOf('@') < 0) {
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
