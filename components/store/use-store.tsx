import { useEffect, useState } from 'react';
import RollbarErrorTracking from '../error-tracking/rollbar';
import FetchAll from '../fetch/fetch-all';
import { dbType } from './db';
import AttendeeStore from './models/attendee-model';
import DocumentDataStore, { formatGoogleDoc } from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore, { formatPerson } from './models/person-model';
import SegmentDocumentDataStore from './models/segment-document-model';
import TimeDataStore from './models/segment-model';
import TaskDocumentDataStore from './models/task-document-model';
import TaskDataStore from './models/task-model';
import TfidfDataStore from './models/tfidf-model';

export interface IStore {
  readonly personDataStore: PersonDataStore;
  readonly timeDataStore: TimeDataStore;
  readonly documentDataStore: DocumentDataStore;
  readonly driveActivityStore: DriveActivityDataStore;
  readonly tfidfStore: TfidfDataStore;
  readonly taskStore: TaskDataStore;
  readonly taskDocumentStore: TaskDocumentDataStore;
  readonly attendeeDataStore: AttendeeStore;
  readonly lastUpdated: Date;
  readonly segmentDocumentStore: SegmentDocumentDataStore;
  readonly refetch: () => void;
  readonly isLoading: boolean;
  readonly scope?: string;
  readonly loadingMessage?: string;
  readonly googleOauthToken?: string;
  readonly error?: Error;
}

export const setupStoreNoFetch = (db: dbType): IStore => {
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore(db);
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const taskDocumentStore = new TaskDocumentDataStore(db);
  const taskStore = new TaskDataStore(db);

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    segmentDocumentStore,
    taskStore,
    taskDocumentStore,
    tfidfStore,
    lastUpdated: new Date(),
    isLoading: false,
    loadingMessage: undefined,
    refetch: () => false,
    error: undefined,
  };
};

const useStore = (db: dbType, googleOauthToken: string, scope: string): IStore => {
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>('Fetching Data');
  const data = FetchAll(googleOauthToken);
  const [isLoading, setLoading] = useState<boolean>(true);
  const people = (data.personList || []).map((person) => formatPerson(person));
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const taskDataStore = new TaskDataStore(db);
  const taskDocumentDataStore = new TaskDocumentDataStore(db);
  const docs = (data.driveFiles || []).map((doc) => doc && formatGoogleDoc(doc)).filter(Boolean);
  const missingDocs = (data.missingDriveFiles || [])
    .filter(Boolean)
    .map((doc) => formatGoogleDoc(doc!));
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore(db);
  const segmentDocumentStore = new SegmentDocumentDataStore(db);

  // Save calendar events
  useEffect(() => {
    const addData = async () => {
      if (!data.calendarResponseLoading) {
        setLoadingMessage('Saving Calendar Events');
        await timeDataStore.addSegments(data.calendarEvents);
      }
    };
    void addData();
  }, [data.calendarEvents.length.toString()]);

  // Save drive activity
  useEffect(() => {
    const addData = async () => {
      if (!data.driveActivityLoading && data.currentUser?.id) {
        setLoadingMessage('Saving Drive Activity');
        await driveActivityDataStore.addDriveActivityToStore(
          data.driveActivity,
          data.currentUser.id,
        );
      }
    };
    void addData();
  }, [data.driveActivity.length.toString(), data.currentUser?.id]);

  // Save documents
  const documentsToAdd = docs.concat(missingDocs);
  useEffect(() => {
    const addData = async () => {
      if (!data.driveResponseLoading) {
        setLoadingMessage('Saving Documents');
        await documentDataStore.addDocsToStore(documentsToAdd);
      }
    };
    void addData();
  }, [documentsToAdd.length.toString()]);

  // Save takss
  useEffect(() => {
    const addData = async () => {
      if (!data.tasksResponseLoading) {
        setLoadingMessage('Saving Tasks');
        await taskDataStore.addTasksToStore(data.tasks);
      }
    };
    void addData();
  }, [data.tasks.length.toString()]);

  // Relationships
  useEffect(() => {
    const addData = async () => {
      if (data.isLoading) {
        return;
      }

      setLoadingMessage('Saving Contacts');
      await personDataStore.addPeopleToStore(
        people,
        data.currentUser,
        data.contacts,
        data.emailAddresses,
      );

      setLoadingMessage('Saving Meeting Attendee');
      await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll());

      setLoadingMessage('Matching Documents and Meetings');
      await segmentDocumentStore.addSegmentDocumentsToStore(
        driveActivityDataStore,
        timeDataStore,
        attendeeDataStore,
      );

      setLoadingMessage('Matching Tasks, Documents and Meetings');
      await taskDocumentDataStore.addTaskDocumentsToStore(
        driveActivityDataStore,
        timeDataStore,
        taskDataStore,
        data.currentUser ? data.currentUser.id : null,
      );

      if (!data.isLoading) {
        setLoadingMessage(undefined);
        setLoading(false);
        if (data.missingDriveFiles) {
          RollbarErrorTracking.logErrorInRollbar(
            `Missing drive files ${data.missingDriveFiles.length}`,
          );
        }
        if (data.error) {
          RollbarErrorTracking.logErrorInRollbar(`Fetch error ${data.error}`);
        }
      }
    };
    void addData();
  }, [data.isLoading]);

  // When everything is all done do the tfidf one
  /*
  useEffect(() => {
    const addData = async () => {
      if (data.isLoading) {
        return;
      }
      // TFIDF for calendar view
      await tfidfStore.saveDocuments({
        driveActivityStore: driveActivityDataStore,
        timeDataStore,
        personDataStore,
        documentDataStore,
        attendeeDataStore,
      });
    };
    void addData();
  }, [data.isLoading]);
  */

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    segmentDocumentStore,
    tfidfStore,
    taskStore: taskDataStore,
    taskDocumentStore: taskDocumentDataStore,
    lastUpdated: data.lastUpdated,
    isLoading: data.isLoading || isLoading,
    loadingMessage,
    refetch: () => data.refetch(),
    scope,
    googleOauthToken,
    error: data.error,
  };
};

export default useStore;
