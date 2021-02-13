import { sortedUniq } from 'lodash';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import fetchCalendarEvents, { ICalendarEvent } from './fetch-calendar-events';
import fetchContacts from './fetch-contacts';
import fetchDriveFiles from './fetch-drive-files';
import { person } from './fetch-people';
import { fetchSelf } from './fetch-self';

const initialEmailList: string[] = [];

interface IResponse {
  readonly isLoading: boolean;
  readonly error: Error | undefined;
  readonly calendarEvents: ICalendarEvent[];
  readonly driveFiles: gapi.client.drive.File[];
  readonly refetchCalendarEvents: () => Promise<any>;
  readonly refetchDriveFiles: () => Promise<any>;
  readonly contacts: person[];
  readonly currentUser: person;
  readonly lastUpdated: Date;
  readonly emailAddresses: string[];
  readonly addEmailAddressesToStore: (addresses: string[]) => void;
}

/**
 * Fetches data that can be fetched in parallel and creates the person store object
 */
const FetchFirst = (): IResponse => {
  const [emailList, setEmailList] = useState(initialEmailList);
  const addEmailAddressesToStore = (emailAddresses: string[]) => {
    setEmailList(sortedUniq(emailAddresses.concat(emailList)));
  };
  const driveResponse = useAsyncAbortable(fetchDriveFiles, [] as any);
  const contactsResponse = useAsyncAbortable(fetchContacts, [] as any);
  const calendarResponse = useAsyncAbortable(
    () => fetchCalendarEvents(addEmailAddressesToStore),
    [] as any,
  );
  const currentUser = fetchSelf();
  return {
    isLoading: driveResponse.loading || calendarResponse.loading || contactsResponse.loading,
    error: driveResponse.error || calendarResponse.error || contactsResponse.error,
    calendarEvents: calendarResponse.result ? calendarResponse.result.calendarEvents || [] : [],
    driveFiles: driveResponse.result || [],
    refetchCalendarEvents: calendarResponse.execute,
    refetchDriveFiles: driveResponse.execute,
    contacts: contactsResponse.result || [],
    currentUser,
    lastUpdated: new Date(),
    emailAddresses: emailList,
    addEmailAddressesToStore,
  };
};

export default FetchFirst;
