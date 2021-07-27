import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { subMinutes } from 'date-fns';
import { useEffect, useState } from 'react';
import config from '../../constants/config';
import ErrorTracking from '../error-tracking/error-tracking';
import { fetchAllHistory } from '../fetch/chrome/fetch-history';
import FetchAll from '../fetch/fetch-all';
import { dbType } from './db';
import AttendeeStore from './models/attendee-model';
import DocumentDataStore from './models/document-model';
import DomainBlocklistStore from './models/domain-blocklist-model';
import DomainFilterStore from './models/domain-filter-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore from './models/person-model';
import SegmentDocumentDataStore from './models/segment-document-model';
import TimeDataStore from './models/segment-model';
import TfidfDataStore from './models/tfidf-model';
import WebsiteBlocklistStore from './models/website-blocklist-model';
import WebsiteImageStore from './models/website-image-model';
import WebsitesStore from './models/website-model';
import WebsitePinStore from './models/website-pin-model';

export interface IStore {
  readonly domainFilterStore: DomainFilterStore;
  readonly websiteBlocklistStore: WebsiteBlocklistStore;
  readonly domainBlocklistStore: DomainBlocklistStore;
  readonly personDataStore: PersonDataStore;
  readonly timeDataStore: TimeDataStore;
  readonly documentDataStore: DocumentDataStore;
  readonly driveActivityStore: DriveActivityDataStore;
  readonly tfidfStore: TfidfDataStore;
  readonly attendeeDataStore: AttendeeStore;
  readonly websitesStore: WebsitesStore;
  readonly websiteImageStore: WebsiteImageStore;
  readonly websitePinStore: WebsitePinStore;
  readonly lastUpdated: Date;
  readonly segmentDocumentStore: SegmentDocumentDataStore;
  readonly refetch: () => void;
  readonly isLoading: boolean;
  readonly scope?: string;
  readonly loadingMessage?: string;
  readonly googleOauthToken?: string;
  readonly error?: Error;
  readonly isPeopleLoading: boolean;
  readonly isMeetingsLoading: boolean;
  readonly isDocumentsLoading: boolean;
  readonly isDriveActivityLoading: boolean;
}

export const setupStoreNoFetch = (db: dbType | null): IStore | null => {
  if (!db) {
    return null;
  }
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore(db);
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const websitesStore = new WebsitesStore(db);
  const websiteImageStore = new WebsiteImageStore(db);
  const websiteBlocklistStore = new WebsiteBlocklistStore(db);
  const websitePinStore = new WebsitePinStore(db);
  const domainBlocklistStore = new DomainBlocklistStore(db);
  const domainFilterStore = new DomainFilterStore(db);

  return {
    domainFilterStore,
    websiteBlocklistStore,
    domainBlocklistStore,
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    websitesStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    websitePinStore,
    segmentDocumentStore,
    websiteImageStore,
    tfidfStore,
    lastUpdated: new Date(),
    isLoading: false,
    loadingMessage: undefined,
    refetch: () => false,
    error: undefined,
    isPeopleLoading: false,
    isMeetingsLoading: false,
    isDocumentsLoading: false,
    isDriveActivityLoading: false,
  };
};

const useStoreWithFetching = (
  db: dbType,
  googleOauthToken: string,
  scope: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
): IStore => {
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>('Fetching Data');
  const data = FetchAll(googleOauthToken, microsoftAccount, msal);
  const [isLoading, setLoading] = useState<boolean>(true);

  const people = data.personList || [];
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const documents = data.driveFiles || [];
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore(db);
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const websitesStore = new WebsitesStore(db);
  const websiteImageStore = new WebsiteImageStore(db);
  const websiteBlocklistStore = new WebsiteBlocklistStore(db);
  const domainBlocklistStore = new DomainBlocklistStore(db);
  const domainFilterStore = new DomainFilterStore(db);
  const websitePinStore = new WebsitePinStore(db);

  // Save calendar events
  useEffect(() => {
    const addData = async () => {
      if (!data.calendarResponseLoading) {
        setLoadingMessage('Saving Calendar Events');
        // Sometimes there is an error and we get no data, don't drop the store in that case
        await timeDataStore.addSegments(data.calendarEvents, data.calendarEvents.length > 0);
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
  useEffect(() => {
    const addData = async () => {
      if (!data.driveResponseLoading) {
        setLoadingMessage('Saving Documents');
        await documentDataStore.addDocuments(documents, true);
      }
    };
    void addData();
  }, [documents.length.toString()]);

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

      // Save history
      const currentWebsites = await websitesStore.getAll(
        domainBlocklistStore,
        websiteBlocklistStore,
      );
      if (currentWebsites.length < 1) {
        setLoadingMessage('Saving Websites');
        const historyWebsites = await fetchAllHistory();
        await websitesStore.addHistoryToStore(historyWebsites);
      }

      // Cleanup website images
      const currentImages = await websiteImageStore.getAll();
      await websiteImageStore.cleanupWebsiteImages(currentImages);

      // Cleanup websites
      await websitesStore.cleanupWebsites(currentWebsites);

      setLoadingMessage('Saving Meeting Attendee');
      await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll(), personDataStore);

      setLoadingMessage('Matching Documents and Meetings');
      await segmentDocumentStore.addSegmentDocumentsToStore(
        driveActivityDataStore,
        timeDataStore,
        attendeeDataStore,
        personDataStore,
      );

      if (!data.isLoading) {
        setLoadingMessage(undefined);
        setLoading(false);
        if (data.error) {
          ErrorTracking.logErrorInRollbar(`Fetch error ${data.error}`);
        }
        localStorage.setItem(config.LAST_UPDATED, new Date().toISOString());
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
    websitesStore,
    websiteImageStore,
    websiteBlocklistStore,
    websitePinStore,
    domainBlocklistStore,
    domainFilterStore,
    tfidfStore,
    lastUpdated: data.lastUpdated,
    isLoading: data.isLoading || isLoading,
    isPeopleLoading: data.peopleLoading,
    isMeetingsLoading: data.calendarResponseLoading,
    isDocumentsLoading: data.driveResponseLoading,
    isDriveActivityLoading: data.driveActivityLoading,
    loadingMessage,
    refetch: () => data.refetch(),
    scope,
    googleOauthToken,
    error: data.error,
  };
};

const updateThrottleMinutes = 1;

const useStore = (
  db: dbType | null,
  googleOauthToken: string,
  googleScope: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
): IStore | null => {
  if (!db) {
    return null;
  }
  const lastUpdated = localStorage.getItem(config.LAST_UPDATED);
  const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : undefined;
  if (!lastUpdatedDate || lastUpdatedDate < subMinutes(new Date(), updateThrottleMinutes)) {
    console.log('fetching data');
    // eslint-disable-next-line
    return useStoreWithFetching(db, googleOauthToken, googleScope, microsoftAccount, msal);
  } else {
    console.log('not fetching data');
    return setupStoreNoFetch(db);
  }
};

export default useStore;
