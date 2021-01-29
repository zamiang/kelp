import { useEffect, useState } from 'react';
import FetchAll from '../fetch/fetch-all';
import { dbType } from './db';
import AttendeeModel from './models/attendee-model';
import DocumentDataStore, { formatGoogleDoc } from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore, { formatPerson } from './models/person-model';
import TimeDataStore from './models/segment-model';
import TfidfDataStore from './models/tfidf-model';

export interface IStore {
  readonly personDataStore: PersonDataStore;
  readonly timeDataStore: TimeDataStore;
  readonly documentDataStore: DocumentDataStore;
  readonly driveActivityStore: DriveActivityDataStore;
  readonly tfidfStore: TfidfDataStore;
  readonly attendeeDataStore: AttendeeModel;
  readonly lastUpdated: Date;
  readonly refetch: () => void;
  readonly isLoading: boolean;
  readonly error?: Error;
}

const useStore = (db: dbType): IStore => {
  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll();
  const [isLoading, setLoading] = useState<boolean>(true);
  const people = (data.personList || []).map((person) => formatPerson(person));
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const docs = (data.driveFiles || []).map((doc) => formatGoogleDoc(doc));
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeModel(db);
  const tfidfStore = new TfidfDataStore(db);

  useEffect(() => {
    const addData = async () => {
      if (data.isLoading) {
        return;
      }
      // TODO: Only create the datastores once data.isLoading is false
      await personDataStore.addPeopleToStore(
        people,
        data.contacts,
        data.emailAddresses,
        data.calendarEvents,
      );

      await timeDataStore.addSegments(data.calendarEvents);
      await documentDataStore.addDocsToStore(docs);
      await driveActivityDataStore.addDriveActivityToStore(data.driveActivity);
      await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll());
      await tfidfStore.saveDocuments({
        driveActivityStore: driveActivityDataStore,
        timeDataStore,
        personDataStore,
        documentDataStore,
        attendeeDataStore,
      });
      setLoading(false);
    };
    void addData();
  }, [data.isLoading]);

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    tfidfStore,
    lastUpdated: data.lastUpdated,
    isLoading: data.isLoading || isLoading,
    refetch: () => data.refetch(),
    error: data.error,
  };
};

export default useStore;
