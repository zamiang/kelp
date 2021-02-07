import { useEffect, useState } from 'react';
import { dbType } from './db';
import AttendeeModel from './models/attendee-model';
import DocumentDataStore from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore from './models/person-model';
import SegmentDocumentModel from './models/segment-document-model';
import TimeDataStore from './models/segment-model';
import TfidfDataStore from './models/tfidf-model';
import data from './store-faker';
import { IStore } from './use-store';

const useFakeStore = (db: dbType): IStore => {
  const [isLoading, setLoading] = useState<boolean>(true);

  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeModel(db);
  const tfidfStore = new TfidfDataStore(db);
  const segmentDocumentStore = new SegmentDocumentModel(db);

  useEffect(() => {
    const addData = async () => {
      await personDataStore.addPeopleToStore(data.people);
      await timeDataStore.addSegments(data.segments);
      await documentDataStore.addDocsToStore(data.documents);
      await driveActivityDataStore.addDriveActivityToStore(data.driveActivity);
      await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll());
      await tfidfStore.saveDocuments({
        driveActivityStore: driveActivityDataStore,
        timeDataStore,
        personDataStore,
        documentDataStore,
        attendeeDataStore,
      });
      await segmentDocumentStore.addSegmentDocumentsToStore(
        driveActivityDataStore,
        timeDataStore,
        attendeeDataStore,
      );
      setLoading(false);
    };
    void addData();
  }, []);

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    segmentDocumentStore,
    tfidfStore,
    isLoading,
    lastUpdated: new Date(),
    refetch: () => null,
  };
};

export default useFakeStore;
