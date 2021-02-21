import { useEffect, useState } from 'react';
import FetchAll from '../fetch/fetch-all';
import { dbType } from './db';
import AttendeeModel from './models/attendee-model';
import DocumentDataStore, { formatGoogleDoc } from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore, { formatPerson } from './models/person-model';
import SegmentDocumentModel from './models/segment-document-model';
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
  readonly segmentDocumentStore: SegmentDocumentModel;
  readonly refetch: () => void;
  readonly isLoading: boolean;
  readonly scope: string;
  readonly loadingMessage?: string;
  readonly googleOauthToken: string;
  readonly error?: Error;
}

const useStore = (db: dbType, googleOauthToken: string, scope: string): IStore => {
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>('Fetching Data');
  const data = FetchAll(googleOauthToken);
  const [isLoading, setLoading] = useState<boolean>(true);
  const people = (data.personList || []).map((person) => formatPerson(person));
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const docs = (data.driveFiles || []).map((doc) => doc && formatGoogleDoc(doc)).filter(Boolean);
  const missingDocs = (data.missingDriveFiles || [])
    .filter(Boolean)
    .map((doc) => formatGoogleDoc(doc!));
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeModel(db);
  const tfidfStore = new TfidfDataStore(db);
  const segmentDocumentStore = new SegmentDocumentModel(db);

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
      if (!data.driveActivityLoading) {
        setLoadingMessage('Saving Drive Activity');
        await driveActivityDataStore.addDriveActivityToStore(data.driveActivity);
      }
    };
    void addData();
  }, [data.driveActivity.length.toString()]);

  // Save people and meeting attendees
  const isPeopleDoneFetching =
    !data.contactsResponseLoading && !data.calendarResponseLoading && !data.currentUserLoading;
  useEffect(() => {
    const addData = async () => {
      if (isPeopleDoneFetching) {
        setLoadingMessage('Saving Contacts');
        await personDataStore.addPeopleToStore(
          people,
          data.currentUser,
          data.contacts,
          data.emailAddresses,
        );
        setLoadingMessage('Saving Meeting Attendee');
        await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll());
      }
    };
    void addData();
  }, [isPeopleDoneFetching]);

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

  // Relationships
  useEffect(() => {
    const addData = async () => {
      if (data.isLoading) {
        return;
      }

      setLoadingMessage('Calculating Document and Meeting relationships');
      await segmentDocumentStore.addSegmentDocumentsToStore(
        driveActivityDataStore,
        timeDataStore,
        attendeeDataStore,
      );
      if (!data.isLoading) {
        setLoadingMessage(undefined);
        setLoading(false);
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
