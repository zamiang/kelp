import { useState } from 'react';
import { dbType } from '../db';
import AttendeeStore from '../models/attendee-model';
import DocumentDataStore from '../models/document-model';
import DomainBlocklistStore from '../models/domain-blocklist-model';
import DomainFilterStore from '../models/domain-filter-model';
import PersonDataStore from '../models/person-model';
import SegmentDocumentDataStore from '../models/segment-document-model';
import EnhancedSegmentStore from '../models/enhanced-segment-store';
import SegmentTagStore from '../models/segment-tag-model';
import TfidfDataStore from '../models/tfidf-model';
import WebsiteBlocklistStore from '../models/website-blocklist-model';
import WebsiteImageStore from '../models/website-image-model';
import WebsiteStore from '../models/enhanced-website-store';
import WebsitePinStore from '../models/website-pin-model';
import WebsiteTagStore from '../models/website-tag-model';
import EnhancedWebsiteVisitStore from '../models/enhanced-website-visit-store';
import { IStore } from '../use-store';

export const useStoreNoFetch = (db: dbType | null, skipHook: boolean): IStore | null => {
  let isLoading = 0;
  let setLoading = (n: number) => console.log('setting loading', n);

  if (!skipHook) {
    // NOTE: @skipHook is need to support execution from the background worker context where hooks are not available

    [isLoading, setLoading] = useState<number>(0);
  }
  if (!db) {
    return null;
  }

  const personDataStore = new PersonDataStore(db);
  const timeDataStore = new EnhancedSegmentStore(db);
  const documentDataStore = new DocumentDataStore(db);
  const attendeeDataStore = new AttendeeStore(db);
  const tfidfStore = new TfidfDataStore();
  const segmentDocumentStore = new SegmentDocumentDataStore(db);
  const websiteStore = new WebsiteStore(db);
  const websiteVisitStore = new EnhancedWebsiteVisitStore(db);
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
    isMeetingsLoading: false,
    isDocumentsLoading: false,
    incrementLoading: () => setLoading(isLoading + 1),
  };
};
