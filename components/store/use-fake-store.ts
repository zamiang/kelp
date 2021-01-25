import { dbType } from './db';
import AttendeeModel from './models/attendee-model';
import DocumentDataStore from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore from './models/person-model';
import TimeDataStore from './models/segment-model';
import data from './store-faker';
import TfidfDataStore from './tfidf-store';
import { IStore } from './use-store';

const useFakeStore = async (db: dbType): Promise<IStore> => {
  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(db);
  await personDataStore.addPeopleToStore(data.people);
  // TODO??
  // personDataStore.addCurrentUserFlag(data.calendarEvents); ?

  const timeDataStore = new TimeDataStore(db);
  await timeDataStore.addSegments(data.segments);

  const documentDataStore = new DocumentDataStore(db);
  await documentDataStore.addDocsToStore(data.documents);

  const driveActivityDataStore = new DriveActivityDataStore(db);
  await driveActivityDataStore.addDriveActivityToStore(data.driveActivity);

  const attendeeDataStore = new AttendeeModel(db);
  await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll());

  const tfidfStore = new TfidfDataStore();
  await tfidfStore.recomputeForFilters(
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
    lastUpdated: new Date(),
    refetch: () => null,
  };
};

export default useFakeStore;
