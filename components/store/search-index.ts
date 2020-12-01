import { IDocument } from './document-store';
import { IPerson } from './person-store';
import { ISegment } from './time-store';
import { IStore } from './use-store';

export interface ISearchItem {
  text: string;
  type: 'segment' | 'document' | 'person';
  item: IPerson | ISegment | IDocument;
}

export default class SearchIndex {
  results: ISearchItem[];

  constructor(store: {
    documentDataStore: IStore['documentDataStore'];
    driveActivityStore: IStore['driveActivityStore'];
    timeDataStore: IStore['timeDataStore'];
    personDataStore: IStore['personDataStore'];
  }) {
    const searchIndex = [] as ISearchItem[];
    // Docs
    store.documentDataStore.getDocs().map((doc) => {
      if (doc && doc.name) {
        searchIndex.push({
          text: doc.name.toLowerCase(),
          type: 'document',
          item: doc,
        });
      }
    });
    // Meetings
    store.timeDataStore.getSegments().map((segment) => {
      if (segment.summary) {
        searchIndex.push({
          text: segment.summary.toLowerCase(),
          type: 'segment',
          item: segment,
        });
      }
    });
    // People
    store.personDataStore.getPeople(false).map((person) => {
      // TODO: Remove need to do indexof
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
