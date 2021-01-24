import { differenceInCalendarDays } from 'date-fns';
import { times } from 'lodash';
import config from '../../constants/config';
import Tfidf from '../shared/tfidf';
import { IStore } from './use-store';

/**
 * Used so that a person's unique first+last name combo makes it through TFIDF and common first or last names are not misrepresented
 */
export const uncommonPunctuation = 'æ';
const currentDate = new Date();
const getDayKey = (day: Date) => differenceInCalendarDays(currentDate, day).toString();

export interface IFilters {
  meetings: boolean;
  people: boolean;
  docs: boolean;
}

export default class TfidfStore {
  private tfidf: Tfidf;
  tfidfMin: number;
  tfidfMax: number;

  constructor(
    store: {
      documentDataStore: IStore['documentDataStore'];
      driveActivityStore: IStore['driveActivityStore'];
      timeDataStore: IStore['timeDataStore'];
      personDataStore: IStore['personDataStore'];
      attendeeDataStore: IStore['attendeeDataStore'];
    },
    filters: IFilters,
  ) {
    // console.warn('setting up tfidf store');
    this.tfidf = new Tfidf(this.getDocumentsByDay(store, filters));
    this.tfidfMin = this.tfidf.getMin() || 0;
    this.tfidfMax = this.tfidf.getMax() || 10;
  }

  recomputeForFilters(
    store: {
      documentDataStore: IStore['documentDataStore'];
      driveActivityStore: IStore['driveActivityStore'];
      timeDataStore: IStore['timeDataStore'];
      personDataStore: IStore['personDataStore'];
    },
    filters: IFilters,
  ) {
    this.tfidf = new Tfidf(this.getDocumentsByDay(store, filters));
    this.tfidfMin = this.tfidf.getMin() || 0;
    this.tfidfMax = this.tfidf.getMax() || 10;
  }

  getDocumentsByDay(
    store: {
      documentDataStore: IStore['documentDataStore'];
      driveActivityStore: IStore['driveActivityStore'];
      timeDataStore: IStore['timeDataStore'];
      personDataStore: IStore['personDataStore'];
    },
    filters: IFilters,
  ) {
    const documentsByDay: any = {};
    times(config.NUMBER_OF_DAYS_BACK).map((day) => {
      documentsByDay[day.toString()] = [];
    });
    // Capture negative
    times(config.NUMBER_OF_DAYS_BACK).map((day) => {
      documentsByDay[(-day).toString()] = [];
    });
    // Docs
    if (filters.docs) {
      store.driveActivityStore.getAll().map((activity) => {
        if (
          activity.link &&
          activity.actorPersonId &&
          store.personDataStore.getPersonById(activity.actorPersonId)?.isCurrentUser
        ) {
          const doc = store.documentDataStore.getByLink(activity.link);
          const day = getDayKey(activity.time);
          if (documentsByDay[day] && doc && doc.name) {
            documentsByDay[day].push(doc?.name);
          }
        }
      });
    }

    // Meetings
    store.timeDataStore.getSegments().map((segment) => {
      const day = getDayKey(segment.start);
      if (filters.meetings) {
        if (documentsByDay[day] && segment.summary) {
          documentsByDay[day].push(segment.summary);
        }
      }
      if (filters.people) {
        segment.formattedAttendees.map((attendee) => {
          const person = store.personDataStore.getPersonById(attendee.personId);
          // TODO: Remove need to do indexof
          if (
            documentsByDay[day] &&
            person &&
            !person.isCurrentUser &&
            person.name.indexOf('person') < 0 &&
            person.name.indexOf('@') < 0
          ) {
            documentsByDay[day].push(person.name.split(' ').join(uncommonPunctuation));
          }
        });
      }
    });

    return Object.keys(documentsByDay).map((key) => ({
      key,
      text: documentsByDay[key].join(' ').toLowerCase(),
    }));
  }

  getForDay(day: Date) {
    const diff = getDayKey(day);
    return this.tfidf.listTerms(Number(diff));
  }
}
