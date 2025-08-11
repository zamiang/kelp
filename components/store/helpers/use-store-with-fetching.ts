import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { useEffect, useState } from 'react';
import config from '../../../constants/config';
import ErrorTracking from '../../error-tracking/error-tracking';
import { fetchAllHistory } from '../../fetch/chrome/fetch-history';
import FetchAll from '../../fetch/fetch-all';
import { dbType } from '../db';
import AttendeeStore from '../models/attendee-model';
import DocumentDataStore from '../models/document-model';
import DomainBlocklistStore from '../models/domain-blocklist-model';
import DomainFilterStore from '../models/domain-filter-model';
import PersonDataStore from '../models/person-model';
import SegmentDocumentDataStore from '../models/segment-document-model';
import TimeDataStore from '../models/segment-model';
import SegmentTagStore from '../models/segment-tag-model';
import TfidfDataStore from '../models/tfidf-model';
import WebsiteBlocklistStore from '../models/website-blocklist-model';
import WebsiteImageStore from '../models/website-image-model';
import WebsiteStore from '../models/enhanced-website-store';
import WebsitePinStore from '../models/website-pin-model';
import WebsiteTagStore from '../models/website-tag-model';
import EnhancedWebsiteVisitStore from '../models/enhanced-website-visit-store';
import { IStore } from '../use-store';

export const useStoreWithFetching = (
  db: dbType,
  googleOauthToken: string,
  scope: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
  isMicrosoftLoadingOrError?: boolean,
): IStore => {
  const data = FetchAll(googleOauthToken, microsoftAccount, msal);

  const [loadingMessage, setLoadingMessage] = useState<string | undefined>('Fetching Data');
  const [isLoading, setLoading] = useState(0);

  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new TimeDataStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const documents = data.driveFiles || [];
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore();
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const websiteStore = new WebsiteStore(db);
  const websiteVisitStore = new EnhancedWebsiteVisitStore(db);
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
      await personDataStore.addPeopleToStore(data.currentUser, data.contacts, data.emailAddresses);

      // Save history
      const currentWebsitesResult = await websiteVisitStore.getAllFiltered(
        domainBlocklistStore,
        websiteBlocklistStore,
      );

      const currentWebsitesCount = currentWebsitesResult.success
        ? currentWebsitesResult.data.total
        : 0;

      if (currentWebsitesCount < 1) {
        console.log('saving browser history');
        setLoadingMessage('Saving Websites');
        const historyWebsites = await fetchAllHistory();
        const addHistoryResult = await websiteStore.addHistoryToStore(historyWebsites);
        if (addHistoryResult.success === false) {
          console.error('Failed to add history to website store:', addHistoryResult.error);
        }
        const addVisitHistoryResult = await websiteVisitStore.addHistoryToStore(
          historyWebsites,
          timeDataStore,
        );
        if (addVisitHistoryResult.success === false) {
          console.error(
            'Failed to add history to website visit store:',
            addVisitHistoryResult.error,
          );
        }
      }

      setLoadingMessage('Saving Meeting Attendee');
      await attendeeDataStore.addAttendeesToStore(await timeDataStore.getAll(), personDataStore);

      setLoadingMessage('Matching Documents and Meetings');
      await segmentDocumentStore.addSegmentDocumentsToStore(timeDataStore, attendeeDataStore);

      if (!data.isLoading) {
        setLoadingMessage(undefined);
        setLoading(1);
        if (data.error) {
          ErrorTracking.logError(`Fetch error ${data.error}`);
        }
        localStorage.setItem(config.LAST_UPDATED, new Date().toISOString());
      }

      const cleanup = async () => {
        console.log('running cleanup');
        const cleanupResults = await Promise.allSettled([
          // Cleanup website images
          websiteImageStore.cleanup(),
          // Cleanup website visits
          websiteVisitStore.cleanup(),
          // Cleanup attendees
          attendeeDataStore.cleanup(),
          // Cleanup segment documents
          segmentDocumentStore.cleanup(),
          // Cleanup meetings
          timeDataStore.cleanup(),
          // Cleanup websites
          websiteStore.cleanup(),
        ]);

        // Log any cleanup failures
        cleanupResults.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Cleanup failed for store ${index}:`, result.reason);
          }
        });
      };
      setTimeout(() => void cleanup(), 5000);
    };
    void addData();
  }, [data.isLoading]);

  return {
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
    isMeetingsLoading: data.calendarResponseLoading,
    isDocumentsLoading: data.driveResponseLoading,
    isLoading,
    loadingMessage,
    refetch: () => data.refetch(),
    scope,
    googleOauthToken,
    error: data.error,
    incrementLoading: () => setLoading(isLoading + 1),
  };
};
