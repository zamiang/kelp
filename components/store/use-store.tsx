import FetchAll from '../fetch/fetch-all';
import DocumentDataStore, { formatGoogleDoc } from './document-store';
import DriveActivityDataStore from './drive-activity-store';
import PersonDataStore, { formatPerson } from './person-store';
import TfidfDataStore from './tfidf-store';
import TimeDataStore from './time-store';

export interface IStore {
  readonly personDataStore: PersonDataStore;
  readonly timeDataStore: TimeDataStore;
  readonly documentDataStore: DocumentDataStore;
  readonly driveActivityStore: DriveActivityDataStore;
  readonly tfidfStore: TfidfDataStore;
  readonly lastUpdated: Date;
  readonly refetch: () => void;
  readonly error?: Error;
}

const useStore = (signedIn: boolean): IStore => {
  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll(signedIn);

  const people = (data.personList || []).map((person) => formatPerson(person));

  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(people, data.emailAddresses || [], data.contacts);
  personDataStore.addDriveActivityToStore(data.driveActivity);
  personDataStore.addGoogleCalendarEventsIdsToStore(data.calendarEvents || []);
  personDataStore.addCurrentUserFlag(data.calendarEvents);
  // console.log('PERSON DATA STORE:', personDataStore);

  const timeDataStore = new TimeDataStore(data.calendarEvents || [], personDataStore);
  timeDataStore.addDriveActivityToStore(data.driveActivity, personDataStore);
  // console.log('TIME DATA STORE:', timeDataStore);

  const docs = (data.driveFiles || []).map((doc) => formatGoogleDoc(doc));
  const documentDataStore = new DocumentDataStore(docs);
  // console.log('DOC DATA STORE:', DocumentDataStore);

  const driveActivityDataStore = new DriveActivityDataStore(data.driveActivity);
  // console.log('DRIVE ACTIVITY DATA STORE:', driveActivityDataStore, data.driveActivity);

  const tfidfStore = new TfidfDataStore(
    {
      driveActivityStore: driveActivityDataStore,
      timeDataStore,
      personDataStore,
      documentDataStore,
    },
    { meetings: true, people: true, docs: true },
  );

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    tfidfStore,
    lastUpdated: data.lastUpdated,
    refetch: () => data.refetch(),
    error: data.error,
  };
};

export default useStore;
