import { differenceInCalendarDays } from 'date-fns';
import { times } from 'lodash';
import config from '../../../constants/config';
import Tfidf from '../../shared/tfidf';
import { dbType } from '../db';
import { IStore } from '../use-store';

/**
 * Used so that a person's unique first+last name combo makes it through TFIDF and common first or last names are not misrepresented
 */
export const uncommonPunctuation = 'æ';
export const getDayKey = (day: Date) => differenceInCalendarDays(new Date(), day).toString();

export interface IFilters {
  meetings: boolean;
  people: boolean;
  docs: boolean;
}

export interface ITfidfRow {
  id: string;
  key: string;
  text: string;
  type: 'documents' | 'meetings' | 'people';
}

export default class TfidfStore {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async getTfidf(filters?: IFilters) {
    const data = await this.getDocumentsByDay(
      filters || { meetings: true, people: true, docs: true },
    );
    const tfidf = new Tfidf(data);
    return tfidf;
  }

  async saveDocuments(store: {
    documentDataStore: IStore['documentDataStore'];
    driveActivityStore: IStore['driveActivityStore'];
    timeDataStore: IStore['timeDataStore'];
    personDataStore: IStore['personDataStore'];
    attendeeDataStore: IStore['attendeeDataStore'];
  }) {
    const documentsByDay: any = {};
    const meetingsByDay: any = {};
    const peopleByDay: any = {};
    times(config.NUMBER_OF_DAYS_BACK).map((day) => {
      documentsByDay[day.toString()] = [];
      meetingsByDay[day.toString()] = [];
      peopleByDay[day.toString()] = [];
    });
    // Capture negative
    times(config.NUMBER_OF_DAYS_BACK).map((day) => {
      documentsByDay[(-day).toString()] = [];
      meetingsByDay[(-day).toString()] = [];
      peopleByDay[(-day).toString()] = [];
    });
    // Docs
    const activityList = await store.driveActivityStore.getAll();
    await Promise.all(
      activityList.map(async (activity) => {
        if (activity.link && activity.actorPersonId) {
          const person = await store.personDataStore.getById(activity.actorPersonId);
          if (person?.isCurrentUser && activity.documentId) {
            const doc = await store.documentDataStore.getById(activity.documentId);
            const day = getDayKey(activity.time);
            if (documentsByDay[day] && doc && doc.name) {
              documentsByDay[day].push(doc?.name);
            }
          }
        }
      }),
    );
    // Meetings
    const segments = await store.timeDataStore.getAll();
    await Promise.all(
      segments.map(async (segment) => {
        const day = getDayKey(segment.start);
        if (meetingsByDay[day] && segment.summary) {
          meetingsByDay[day].push(segment.summary);
        }

        const attendees = await store.attendeeDataStore.getAllForSegmentId(segment.id);
        return Promise.all(
          attendees.map(async (attendee) => {
            if (attendee.personId) {
              const person = await store.personDataStore.getById(attendee.personId);
              // TODO: Remove need to do indexof
              if (
                peopleByDay[day] &&
                person &&
                !person.isCurrentUser &&
                person.name.indexOf('person') < 0 &&
                person.name.indexOf('@') < 0
              ) {
                peopleByDay[day].push(person.name.split(' ').join(uncommonPunctuation));
              }
            }
          }),
        );
      }),
    );

    const documentItems = Object.keys(documentsByDay)
      .map((key) => ({
        key,
        text: documentsByDay[key].join(' '),
      }))
      .map((item) => ({
        id: `documents-${item.key}`,
        key: item.key,
        type: 'documents' as any,
        text: item.text,
      }));
    const meetingItems = Object.keys(meetingsByDay)
      .map((key) => ({
        key,
        text: meetingsByDay[key].join(' '),
      }))
      .map((item) => ({
        id: `meetings-${item.key}`,
        key: item.key,
        type: 'meetings' as any,
        text: item.text,
      }));
    const peopleItems = Object.keys(peopleByDay)
      .map((key) => ({
        key,
        text: peopleByDay[key].join(' '),
      }))
      .map((item) => ({
        id: `activityList-${item.key}`,
        key: item.key,
        type: 'people' as any,
        text: item.text,
      }));
    const tx = this.db.transaction('tfidf', 'readwrite');
    // console.log(documentItems, 'about to save documentitems tfidf');
    await Promise.all(documentItems.map(async (item) => tx.store.put(item)));
    // console.log(meetingItems, 'about to save meetingitems tfidf');
    await Promise.all(meetingItems.map(async (item) => tx.store.put(item)));
    // console.log(peopleItems, 'about to save peopleItems - tfidf');
    await Promise.all(peopleItems.map(async (item) => tx.store.put(item)));
    return tx.done;
  }

  async getDocumentsByDay(filters: IFilters) {
    let results: ITfidfRow[] = [];
    if (filters.docs) {
      results = results.concat(await this.db.getAllFromIndex('tfidf', 'by-type', 'documents'));
    }
    if (filters.meetings) {
      results = results.concat(await this.db.getAllFromIndex('tfidf', 'by-type', 'meetings'));
    }
    if (filters.meetings) {
      results = results.concat(await this.db.getAllFromIndex('tfidf', 'by-type', 'people'));
    }

    return results;
  }
}
