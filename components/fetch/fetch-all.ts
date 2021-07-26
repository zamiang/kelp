import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { flatten, uniq } from 'lodash';
import { pRateLimit } from 'p-ratelimit';
import { useEffect, useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import {
  IDocument,
  IFormattedDriveActivity,
  IPerson,
  ISegment,
  IWebsite,
} from '../store/data-types';
import fetchCalendarEvents, {
  getDocumentsFromCalendarEvents,
} from './google/fetch-calendar-events';
import fetchContacts from './google/fetch-contacts';
import fetchDriveActivityForDocumentIds from './google/fetch-drive-activity';
import fetchDriveFiles from './google/fetch-drive-files';
import FetchMissingGoogleDocs from './google/fetch-missing-google-docs';
import { batchFetchPeople } from './google/fetch-people';
import { fetchSelf } from './google/fetch-self';
import { fetchCalendar } from './microsoft/fetch-calendar';
import { fetchMicrosoftSelf } from './microsoft/fetch-self';

interface IReturnType {
  readonly personList: IPerson[];
  readonly emailAddresses: string[];
  readonly contacts: IPerson[];
  readonly currentUser?: IPerson;
  readonly calendarEvents: ISegment[];
  readonly driveFiles: IDocument[];
  readonly websites: IWebsite[];
  readonly driveActivity: IFormattedDriveActivity[];
  readonly isLoading: boolean;
  readonly refetch: () => void;
  readonly lastUpdated: Date;
  readonly error: Error | undefined;
  readonly driveResponseLoading: boolean;
  readonly calendarResponseLoading: boolean;
  readonly contactsResponseLoading: boolean;
  readonly driveActivityLoading: boolean;
  readonly currentUserLoading: boolean;
  readonly peopleLoading: boolean;
}

const useDebounce = (value: any, delay: number) => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Return a cleanup function that will be called every time ...
      // ... useEffect is re-called. useEffect will only be re-called ...
      // ... if value changes (see the inputs array below).
      // This is how we prevent debouncedValue from changing if value is ...
      // ... changed within the delay period. Timeout gets cleared and restarted.
      // To put it in context, if the user is typing within our app's ...
      // ... search box, we don't want the debouncedValue to update until ...
      // ... they've stopped typing for more than 500ms.
      return () => {
        clearTimeout(handler);
      };
    },
    // Only re-call effect if value changes
    // You could also add the "delay" var to inputs array if you ...
    // ... need to be able to change that dynamically.
    [value],
  );
  return debouncedValue;
};

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
  console.log(currentUser, '<<<<<<<<<<<<<<<<<<');
  if (msal && msal.getActiveAccount()) {
    currentUser.result = fetchMicrosoftSelf(msal, currentUser.result || undefined);
  }
  console.log(currentUser, 'post edit<<<<<<<<<<<<<<<<<<');

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

  /**
   * DRIVE ACTIVITY
   */
  const idsForDriveActivity = uniq(
    googleDocIds.concat(missingGoogleDocs.missingDriveFiles.map((f) => f?.id).filter(Boolean)),
  );
  const googleDocIdsToFetchActivity =
    driveResponse.loading || calendarResponse.loading || missingGoogleDocs.missingGoogleDocsLoading
      ? []
      : (idsForDriveActivity as any);

  const driveActivityResponse = useAsyncAbortable(
    () => fetchDriveActivityForDocumentIds(googleDocIdsToFetchActivity, googleOauthToken, limit),
    [googleDocIdsToFetchActivity.length.toString()] as any, // unsure why this type is a failure
  );
  const driveActivity = driveActivityResponse.result ? driveActivityResponse.result.activity : [];

  /**
   * PEOPLE
   */
  // Find people who are in drive activity but not in contacts and try to fetch them.
  const contactsByPeopleId = {} as any;
  (contactsResponse.result || []).map((c) => (contactsByPeopleId[c.id] = c));
  const peopleIds = uniq(
    driveActivity
      .map((activity) => activity && activity.actorPersonId)
      .filter((id) => id && !contactsByPeopleId[id]),
  );
  const peopleResponse = useAsyncAbortable(
    () => batchFetchPeople(peopleIds as any, googleOauthToken, limit),
    [peopleIds.length.toString()] as any,
  );

  const debouncedIsLoading = useDebounce(
    peopleResponse.loading ||
      currentUser.loading ||
      driveResponse.loading ||
      calendarResponse.loading ||
      contactsResponse.loading ||
      driveActivityResponse.loading ||
      peopleResponse.loading ||
      missingGoogleDocs.missingGoogleDocsLoading,
    200,
  );

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
  if (microsoftCalendarResponse.result && microsoftCalendarResponse.result) {
    calendarEvents = calendarEvents.concat(microsoftCalendarResponse.result);
  }

  return {
    personList: peopleResponse.result ? peopleResponse.result : [],
    driveActivity,
    calendarEvents,
    driveFiles,
    contacts: contactsResponse.result || [],
    currentUser: currentUser.result || undefined,
    emailAddresses: emailList,
    websites: [],
    refetch: async () => {
      // Current user will reloadd if it fails
      await currentUser.execute();
      await calendarResponse.execute();
      await driveResponse.execute();
      await peopleResponse.execute();
    },
    lastUpdated: new Date(),
    currentUserLoading: currentUser.loading,
    driveResponseLoading: driveResponse.loading,
    driveActivityLoading: driveActivityResponse.loading,
    calendarResponseLoading: calendarResponse.loading,
    contactsResponseLoading: contactsResponse.loading,
    peopleLoading: peopleResponse.loading,
    isLoading: debouncedIsLoading,
    error:
      peopleResponse.error ||
      currentUser.error ||
      contactsResponse.error ||
      driveResponse.error ||
      calendarResponse.error ||
      driveActivityResponse.error ||
      peopleResponse.error ||
      missingGoogleDocs.missingGoogleDocsError,
  };
};

export default FetchAll;
