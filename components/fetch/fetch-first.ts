import { uniq } from 'lodash';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import fetchCalendarEvents from './fetch-calendar-events';
import fetchContacts from './fetch-contacts';
import fetchDriveFiles from './fetch-drive-files';
import { fetchSelf } from './fetch-self';

const initialEmailList: string[] = [];

/**
 * Fetches data that can be fetched in parallel and creates the person store object
 */
const FetchFirst = (googleOauthToken: string) => {
  const [emailList, setEmailList] = useState(initialEmailList);
  const addEmailAddressesToStore = (emailAddresses: string[]) => {
    setEmailList(uniq(emailAddresses.concat(emailList)));
  };
  const driveResponse = useAsyncAbortable(() => fetchDriveFiles(googleOauthToken), [] as any);
  const contactsResponse = useAsyncAbortable(() => fetchContacts(googleOauthToken), [] as any);
  const calendarResponse = useAsyncAbortable(
    () => fetchCalendarEvents(addEmailAddressesToStore, googleOauthToken),
    [] as any,
  );

  const currentUser = useAsyncAbortable(() => fetchSelf(googleOauthToken), [] as any);
  return {
    isLoading: driveResponse.loading || calendarResponse.loading || contactsResponse.loading,
    driveResponseLoading: driveResponse.loading,
    calendarResponseLoading: calendarResponse.loading,
    contactsResponseLoading: contactsResponse.loading,
    currentUserLoading: currentUser.loading,
    error: driveResponse.error || calendarResponse.error || contactsResponse.error,
    calendarEvents: calendarResponse.result
      ? calendarResponse.result.calendarEvents.filter(Boolean) || []
      : [],
    driveFiles: driveResponse.result ? driveResponse.result.filter(Boolean) : [],
    refetchCalendarEvents: calendarResponse.execute,
    refetchDriveFiles: driveResponse.execute,
    contacts: contactsResponse.result ? contactsResponse.result.filter(Boolean) : [],
    currentUser: currentUser.result,
    lastUpdated: new Date(),
    emailAddresses: emailList,
    addEmailAddressesToStore,
  };
};

export default FetchFirst;
