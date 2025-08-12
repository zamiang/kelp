import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { flatten, uniq } from 'lodash';
import { pRateLimit } from 'p-ratelimit';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import { useThrottle } from 'react-use';
import { IDocument, IPerson, ISegment, IWebsite } from '../store/data-types';
import { createNewPersonFromEmail } from '../store/models/person-model';
import fetchCalendarEvents, {
  getDocumentsFromCalendarEvents,
} from './google/fetch-calendar-events';
import fetchContacts from './google/fetch-contacts';
import fetchDriveFiles from './google/fetch-drive-files';
import FetchMissingGoogleDocs from './google/fetch-missing-google-docs';
import { fetchSelf } from './google/fetch-self';
import { fetchCalendar } from './microsoft/fetch-calendar';
import { fetchMicrosoftSelf } from './microsoft/fetch-self';

interface IReturnType {
  readonly emailAddresses: string[];
  readonly contacts: IPerson[];
  readonly currentUser?: IPerson;
  readonly calendarEvents: ISegment[];
  readonly driveFiles: IDocument[];
  readonly websites: IWebsite[];
  readonly isLoading: boolean;
  readonly refetch: () => void;
  readonly lastUpdated: Date;
  readonly error: Error | undefined;
  readonly driveResponseLoading: boolean;
  readonly calendarResponseLoading: boolean;
  readonly contactsResponseLoading: boolean;
  readonly currentUserLoading: boolean;
}

// create a rate limiter that allows up to x API calls per second, with max concurrency of y
const limit = pRateLimit({
  interval: 1000, // 1000 ms == 1 second
  rate: 6,
  concurrency: 4,
  maxDelay: 1000 * 120, // an API call delayed > 120 sec is rejected
});

const initialEmailList: string[] = [];

const FetchAll = (
  googleOauthToken: string,
  microsoftAccount?: AccountInfo,
  msal?: IPublicClientApplication,
): IReturnType => {
  const [emailList, setEmailList] = useState(initialEmailList);
  const addEmailAddressesToStore = (emailAddresses: string[]) => {
    setEmailList(uniq(emailAddresses.concat(emailList)));
  };

  /**
   * CURRENT USER
   */
  const currentUser = useAsyncAbortable(() => fetchSelf(googleOauthToken), [
    googleOauthToken,
  ] as any);
  if (msal && msal.getActiveAccount()) {
    currentUser.result = fetchMicrosoftSelf(msal, currentUser.result || undefined);
  }

  /**
   * DRIVE FILES
   */
  const driveResponse = useAsyncAbortable(() => fetchDriveFiles(googleOauthToken), [
    googleOauthToken,
  ] as any);

  /**
   * CONTACTS
   */
  const contactsResponse = useAsyncAbortable(() => fetchContacts(googleOauthToken), [
    googleOauthToken,
  ] as any);

  /**
   * CALENDAR
   */
  const calendarResponse = useAsyncAbortable(
    () => fetchCalendarEvents(addEmailAddressesToStore, googleOauthToken),
    [googleOauthToken] as any,
  );

  /**
   * MISSING GOOGLE DOCS
   */
  // Find documents that are in meeting descriptions and make sure to fetch them as well
  const potentiallyMissingGoogleDocIds = flatten(
    (calendarResponse.result?.calendarEvents || []).map(
      (event) => getDocumentsFromCalendarEvents(event).documentIds,
    ),
  ).filter(Boolean);
  const googleDocIds = (driveResponse.result || []).map((file) => file?.id).filter(Boolean);
  const missingGoogleDocIds = uniq(
    potentiallyMissingGoogleDocIds.filter((id) => !googleDocIds.includes(id)),
  );
  const missingGoogleDocs = FetchMissingGoogleDocs({
    missingGoogleDocIds,
    googleOauthToken,
    limit,
  });

  const isLoadingDebounced = useThrottle(
    currentUser.loading ||
      driveResponse.loading ||
      calendarResponse.loading ||
      contactsResponse.loading ||
      missingGoogleDocs.missingGoogleDocsLoading,
    200,
  );

  const debouncedLastUpdated = useThrottle(new Date(), 200);

  const driveFiles = (driveResponse.result || []).filter(Boolean) as IDocument[];
  if (missingGoogleDocs.missingDriveFiles) {
    driveFiles.concat(missingGoogleDocs.missingDriveFiles.filter(Boolean) as IDocument[]);
  }

  /**
   * Microsoft
   */
  const microsoftCalendarResponse = useAsyncAbortable(
    () => fetchCalendar(microsoftAccount, msal, currentUser?.result || undefined),
    [microsoftAccount?.localAccountId] as any,
  );

  let calendarEvents = calendarResponse.result ? calendarResponse.result.calendarEvents : [];
  if (microsoftCalendarResponse.result) {
    calendarEvents = calendarEvents.concat(microsoftCalendarResponse.result);
    if (contactsResponse.result) {
      const calendarEventsPeople = uniq(
        flatten(calendarEvents.map((c) => c.attendees)).map((a) => a.email),
      )
        .map((email) => email && createNewPersonFromEmail(email))
        .filter(Boolean) as IPerson[];
      contactsResponse.result.concat(calendarEventsPeople);
    }
  }

  return {
    calendarEvents,
    driveFiles,
    contacts: contactsResponse.result || [],
    currentUser: currentUser.result || undefined,
    emailAddresses: emailList,
    websites: [],
    refetch: async () => {
      // Current user will reload if it fails
      await currentUser.execute();
      await calendarResponse.execute();
      await driveResponse.execute();
      await microsoftCalendarResponse.execute();
    },
    lastUpdated: debouncedLastUpdated,
    currentUserLoading: currentUser.loading,
    driveResponseLoading: driveResponse.loading,
    calendarResponseLoading: calendarResponse.loading || microsoftCalendarResponse.loading,
    contactsResponseLoading: contactsResponse.loading || microsoftCalendarResponse.loading,
    isLoading: isLoadingDebounced,
    error:
      currentUser.error ||
      contactsResponse.error ||
      driveResponse.error ||
      calendarResponse.error ||
      missingGoogleDocs.missingGoogleDocsError,
  };
};

export default FetchAll;
