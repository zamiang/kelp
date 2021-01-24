import FetchAll from '../fetch/fetch-all';
import { dbType } from './db';
import AttendeeModel from './models/attendee-model';
import DocumentDataStore, { formatGoogleDoc } from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore, { formatPerson } from './models/person-model';
import TimeDataStore from './models/segment-model';
import TfidfDataStore from './tfidf-store';

export interface IStore {
  readonly personDataStore: PersonDataStore;
  readonly timeDataStore: TimeDataStore;
  readonly documentDataStore: DocumentDataStore;
  readonly driveActivityStore: DriveActivityDataStore;
  readonly tfidfStore: TfidfDataStore;
  readonly attendeeDataStore: AttendeeModel;
  readonly lastUpdated: Date;
  readonly refetch: () => void;
  readonly error?: Error;
}

const useStore = async (signedIn: boolean, db: dbType): Promise<IStore> => {
  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll(signedIn);

  const people = (data.personList || []).map((person) => formatPerson(person));

  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(db);
  await personDataStore.addContactsToStore(data.contacts);
  await personDataStore.addPeopleToStore(people);
  // todo: data.emailAddresses || [], data.contacts);
  // TODO: personDataStore.addCurrentUserFlag(data.calendarEvents);

  const timeDataStore = new TimeDataStore(db);
  await timeDataStore.addSegments(data.calendarEvents);

  const documentDataStore = new DocumentDataStore(db);
  const docs = (data.driveFiles || []).map((doc) => formatGoogleDoc(doc));
  await documentDataStore.addDocsToStore(docs);

  const driveActivityDataStore = new DriveActivityDataStore(db);
  await driveActivityDataStore.addDriveActivityToStore(data.driveActivity);

  const attendeeDataStore = new AttendeeModel(db);
  await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll());

  const tfidfStore = new TfidfDataStore(
    {
      driveActivityStore: driveActivityDataStore,
      timeDataStore,
      personDataStore,
      documentDataStore,
      attendeeDataStore,
    },
    { meetings: true, people: true, docs: true },
  );

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    tfidfStore,
    lastUpdated: data.lastUpdated,
    refetch: () => data.refetch(),
    error: data.error,
  };
};

export default useStore;
