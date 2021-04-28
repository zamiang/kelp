import { useEffect, useState } from 'react';
import { dbType } from './db';
import AttendeeModel from './models/attendee-model';
import DocumentDataStore from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore from './models/person-model';
import SegmentDocumentModel from './models/segment-document-model';
import TimeDataStore from './models/segment-model';
import TaskDocumentDataStore from './models/task-document-model';
import TaskDataStore from './models/task-model';
import TfidfDataStore from './models/tfidf-model';
import TopSitesStore from './models/top-website-model';
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
  const taskDataStore = new TaskDataStore(db);
  const taskDocumentDataStore = new TaskDocumentDataStore(db);
  const topWebsitesStore = new TopSitesStore(db);

  useEffect(() => {
    const addData = async () => {
      await personDataStore.addPeopleToStore(data.people, data.currentUser);
      await timeDataStore.addSegments(data.segments, true);
      await documentDataStore.addDocuments(data.documents, true);
      await driveActivityDataStore.addDriveActivityToStore(data.driveActivity, data.currentUser.id);
      await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll(), personDataStore);
      await taskDataStore.addTasksToStore(data.tasks, true);
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
        personDataStore,
      );
      await taskDocumentDataStore.addTaskDocumentsToStore(
        driveActivityDataStore,
        timeDataStore,
        taskDataStore,
        data.currentUser.id,
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
    topWebsitesStore,
    attendeeDataStore,
    segmentDocumentStore,
    taskStore: taskDataStore,
    taskDocumentStore: taskDocumentDataStore,
    tfidfStore,
    isLoading,
    lastUpdated: new Date(),
    scope: 'n/a',
    googleOauthToken: 'none',
    refetch: () => null,
    isPeopleLoading: false,
    isMeetingsLoading: false,
    isDocumentsLoading: false,
    isDriveActivityLoading: false,
    isTasksLoading: false,
  };
};

export default useFakeStore;
