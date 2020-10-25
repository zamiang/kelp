import { differenceInCalendarDays } from 'date-fns';
import { times } from 'lodash';
import config from '../../constants/config';
import Tfidf from '../shared/tfidf/tfidf';
import { IStore } from './use-store';

export default class TfidfStore {
  private tfidf: Tfidf;
  tfidfMin: number;
  tfidfMax: number;

  constructor(store: {
    docDataStore: IStore['docDataStore'];
    driveActivityStore: IStore['driveActivityStore'];
    timeDataStore: IStore['timeDataStore'];
    personDataStore: IStore['personDataStore'];
  }) {
    // console.warn('setting up tfidf store');
    this.tfidf = new Tfidf(this.getDocumentsByDay(store));
    this.tfidfMin = this.tfidf.getMin() || 0;
    this.tfidfMax = this.tfidf.getMax() || 10;
  }

  getDocumentsByDay(store: {
    docDataStore: IStore['docDataStore'];
    driveActivityStore: IStore['driveActivityStore'];
    timeDataStore: IStore['timeDataStore'];
    personDataStore: IStore['personDataStore'];
  }) {
    const documentsByDay = new Array(config.NUMBER_OF_DAYS_BACK);
    const currentDate = new Date();
    times(config.NUMBER_OF_DAYS_BACK).map((day) => {
      documentsByDay[day] = [];
    });
    // Docs
    store.driveActivityStore.getAll().map((activity) => {
      if (activity.link) {
        const doc = store.docDataStore.getByLink(activity.link);
        const day = differenceInCalendarDays(currentDate, activity.time);
        if (doc && doc.name) {
          documentsByDay[day].push(doc?.name.toLowerCase());
        }
      }
    });
    // Meetings
    store.timeDataStore.getSegments().map((segment) => {
      const day = differenceInCalendarDays(currentDate, segment.start);
      if (segment.summary) {
        documentsByDay[day].push(segment.summary.toLowerCase());
      }

      segment.formattedAttendees.map((attendee) => {
        const person = store.personDataStore.getPersonById(attendee.personId);
        // TODO: Remove need to do indexof
        if (person && person.name.indexOf('person') < 0 && person.name.indexOf('@') < 0) {
          documentsByDay[day].push(person.name.toLowerCase());
        }
      });
    });
    return documentsByDay.map((day, index) => ({
      key: index.toString(),
      text: day.join(' '),
    }));
  }

  getForDay(day: Date) {
    const currentDate = new Date();
    const diff = differenceInCalendarDays(currentDate, day);
    return this.tfidf.listTerms(diff);
  }
}
