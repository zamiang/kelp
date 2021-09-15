import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { useEffect, useState } from 'react';
import config from '../../constants/config';
import ErrorTracking from '../error-tracking/error-tracking';
import { fetchAllHistory } from '../fetch/chrome/fetch-history';
import FetchAll from '../fetch/fetch-all';
import { migrateWebsites } from '../shared/migrate-websites';
import { dbType } from './db';
import AttendeeStore from './models/attendee-model';
import DocumentDataStore from './models/document-model';
import DomainBlocklistStore from './models/domain-blocklist-model';
import DomainFilterStore from './models/domain-filter-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore from './models/person-model';
import SegmentDocumentDataStore from './models/segment-document-model';
import TimeDataStore from './models/segment-model';
import SegmentTagStore from './models/segment-tag-model';
import TfidfDataStore from './models/tfidf-model';
import WebsiteBlocklistStore from './models/website-blocklist-model';
import WebsiteImageStore from './models/website-image-model';
import WebsiteStore from './models/website-item-model';
import DeprecatedWebsiteStore from './models/website-model';
import WebsitePinStore from './models/website-pin-model';
import WebsiteTagStore from './models/website-tag-model';
import WebsiteVisitStore from './models/website-visit-model';

export interface IStore {
  readonly domainFilterStore: DomainFilterStore;
  readonly websiteBlocklistStore: WebsiteBlocklistStore;
  readonly websiteTagStore: WebsiteTagStore;
  readonly domainBlocklistStore: DomainBlocklistStore;
  readonly personDataStore: PersonDataStore;
  readonly timeDataStore: TimeDataStore;
  readonly documentDataStore: DocumentDataStore;
  readonly driveActivityStore: DriveActivityDataStore;
  readonly tfidfStore: TfidfDataStore;
  readonly attendeeDataStore: AttendeeStore;
  readonly websiteStore: WebsiteStore;
  readonly websiteVisitStore: WebsiteVisitStore;
  readonly websiteImageStore: WebsiteImageStore;
  readonly websitePinStore: WebsitePinStore;
  readonly segmentTagStore: SegmentTagStore;
  readonly segmentDocumentStore: SegmentDocumentDataStore;
  readonly refetch: () => void;
  readonly scope?: string;
  readonly loadingMessage?: string;
  readonly googleOauthToken?: string;
  readonly error?: Error;
  readonly isPeopleLoading: boolean;
  readonly isMeetingsLoading: boolean;
  readonly isDocumentsLoading: boolean;
  readonly isDriveActivityLoading: boolean;
  readonly isLoading: number;

  readonly incrementLoading: () => void;
}

export const useStoreNoFetch = (db: dbType | null): IStore | null => {
  const [isLoading, setLoading] = useState<number>(0);

  if (!db) {
    return null;
  }
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore();
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const websiteStore = new WebsiteStore(db);
  const websiteVisitStore = new WebsiteVisitStore(db);
  const websiteImageStore = new WebsiteImageStore(db);
  const websiteBlocklistStore = new WebsiteBlocklistStore(db);
  const websitePinStore = new WebsitePinStore(db);
  const domainBlocklistStore = new DomainBlocklistStore(db);
  const domainFilterStore = new DomainFilterStore(db);
  const websiteTagStore = new WebsiteTagStore(db);
  const segmentTagStore = new SegmentTagStore(db);

  return {
    domainFilterStore,
    websiteBlocklistStore,
    domainBlocklistStore,
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    websiteStore,
    websiteVisitStore,
    websiteTagStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    websitePinStore,
    segmentDocumentStore,
    websiteImageStore,
    tfidfStore,
    segmentTagStore,
    isLoading,
    loadingMessage: undefined,
    refetch: () => false,
    error: undefined,
    isPeopleLoading: false,
    isMeetingsLoading: false,
    isDocumentsLoading: false,
    isDriveActivityLoading: false,
    incrementLoading: () => setLoading(isLoading + 1),
  };
};

const useStoreWithFetching = (
  db: dbType,
  googleOauthToken: string,
  scope: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
  isMicrosoftLoadingOrError?: boolean,
): IStore => {
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>('Fetching Data');
  const data = FetchAll(googleOauthToken, microsoftAccount, msal);
  const [isLoading, setLoading] = useState<number>(0);

  const people = data.personList || [];
  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const documents = data.driveFiles || [];
  const driveActivityDataStore = new DriveActivityDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore();
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const websiteStore = new WebsiteStore(db);
  const websiteVisitStore = new WebsiteVisitStore(db);
  const websiteImageStore = new WebsiteImageStore(db);
  const websiteBlocklistStore = new WebsiteBlocklistStore(db);
  const domainBlocklistStore = new DomainBlocklistStore(db);
  const domainFilterStore = new DomainFilterStore(db);
  const websitePinStore = new WebsitePinStore(db);
  const websiteTagStore = new WebsiteTagStore(db);
  const segmentTagStore = new SegmentTagStore(db);

  // Save calendar events
  useEffect(() => {
    const addData = async () => {
      if (!data.calendarResponseLoading && !isMicrosoftLoadingOrError) {
        setLoadingMessage('Saving Calendar Events');
        // Sometimes there is an error and we get no data, don't drop the store in that case
        await timeDataStore.addSegments(data.calendarEvents, data.calendarEvents.length > 0);
      }
    };
    void addData();
  }, [data.calendarEvents.length.toString(), isMicrosoftLoadingOrError]);

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
      const currentWebsites = await websiteVisitStore.getAll(
        domainBlocklistStore,
        websiteBlocklistStore,
      );

      // for the migraiton
      const deprecatedWebsiteStore = new DeprecatedWebsiteStore(db);
      const priorWebsites = await deprecatedWebsiteStore.getAll();

      // TODO: DO THE MIGRATION HERE
      if (priorWebsites.length > 0) {
        console.log('migrating to new store');
        await migrateWebsites({ deprecatedWebsiteStore, websiteVisitStore, websiteStore });
      }
      if (currentWebsites.length < 1) {
        console.log('saving chrome history');
        setLoadingMessage('Saving Websites');
        const historyWebsites = await fetchAllHistory();
        await websiteStore.addHistoryToStore(historyWebsites);
        await websiteVisitStore.addHistoryToStore(historyWebsites, timeDataStore);
      }

      // Cleanup website images
      // await websiteImageStore.cleanupWebsiteImages();
      // Cleanup website visits
      // await websiteVisitStore.cleanupWebsites();

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
        setLoading(1);
        if (data.error) {
          ErrorTracking.logErrorInRollbar(`Fetch error ${data.error}`);
        }
        localStorage.setItem(config.LAST_UPDATED, new Date().toISOString());
      }
    };
    void addData();
  }, [data.isLoading]);

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    segmentDocumentStore,
    websiteStore,
    websiteVisitStore,
    websiteImageStore,
    websiteTagStore,
    websiteBlocklistStore,
    websitePinStore,
    domainBlocklistStore,
    domainFilterStore,
    segmentTagStore,
    tfidfStore,
    isLoading,
    isPeopleLoading: data.peopleLoading,
    isMeetingsLoading: data.calendarResponseLoading,
    isDocumentsLoading: data.driveResponseLoading,
    isDriveActivityLoading: data.driveActivityLoading,
    loadingMessage,
    refetch: () => data.refetch(),
    scope,
    googleOauthToken,
    error: data.error,
    incrementLoading: () => setLoading(isLoading + 1),
  };
};

const useStore = (
  shouldFetch: boolean,
  db: dbType | null,
  googleOauthToken: string,
  googleScope: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
  isMicrosoftLoadingOrError?: boolean,
): IStore | null => {
  if (!db) {
    return null;
  }

  // Always fetch for microsoft, no real rate limit issues yet
  if (microsoftAccount || shouldFetch) {
    console.log('fetching data');
    // eslint-disable-next-line
    return useStoreWithFetching(
      db,
      googleOauthToken,
      googleScope,
      microsoftAccount,
      msal,
      isMicrosoftLoadingOrError,
    );
  } else {
    console.log('not fetching data');
    // eslint-disable-next-line
    return useStoreNoFetch(db);
  }
};

export default useStore;
