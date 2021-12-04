import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { dbType } from './db';
import { useStoreNoFetch } from './helpers/use-store-no-fetching';
import { useStoreWithFetching } from './helpers/use-store-with-fetching';
import AttendeeStore from './models/attendee-model';
import DocumentDataStore from './models/document-model';
import DomainBlocklistStore from './models/domain-blocklist-model';
import DomainFilterStore from './models/domain-filter-model';
import PersonDataStore from './models/person-model';
import SegmentDocumentDataStore from './models/segment-document-model';
import TimeDataStore from './models/segment-model';
import SegmentTagStore from './models/segment-tag-model';
import TfidfDataStore from './models/tfidf-model';
import WebsiteBlocklistStore from './models/website-blocklist-model';
import WebsiteImageStore from './models/website-image-model';
import WebsiteStore from './models/website-item-model';
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
  readonly isMeetingsLoading: boolean;
  readonly isDocumentsLoading: boolean;
  readonly isLoading: number;

  readonly incrementLoading: () => void;
}

const useStore = (
  shouldFetch: boolean,
  db: dbType | null,
  googleScope: string,
  googleOauthToken?: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
  isMicrosoftLoadingOrError?: boolean,
): IStore | null => {
  if (!db) {
    return null;
  }

  if ((googleOauthToken || microsoftAccount) && shouldFetch) {
    console.log('fetching data');
    // eslint-disable-next-line
    return useStoreWithFetching(
      db,
      googleOauthToken!,
      googleScope,
      microsoftAccount,
      msal,
      isMicrosoftLoadingOrError,
    );
  }
  console.log('not fetching data');
  // eslint-disable-next-line
  return useStoreNoFetch(db, false);
};

export default useStore;
