import { useState } from 'react';
import { useAsync } from 'react-async-hook';
import fetchCalendarEvents from './fetch-calendar-events';
import fetchDriveFiles from './fetch-drive-files';

export interface IProps {
  accessToken: string;
}

const initialEmailList: string[] = [];

/**
 * Fetches data that can be fetched in parallel and creates the person store object
 */
const FetchFirst = (accessToken: string) => {
  const [emailList, setEmailList] = useState(initialEmailList);
  const addEmailAddressesToStore = (emailAddresses: string[]) => {
    setEmailList(emailAddresses);
  };

  const driveResponse = useAsync(fetchDriveFiles, [accessToken]);
  const calendarResponse = useAsync(() => fetchCalendarEvents(addEmailAddressesToStore), [
    accessToken,
  ]);

  return {
    isLoading: driveResponse.loading && calendarResponse.loading && emailList,
    calendarEvents: calendarResponse.result ? calendarResponse.result.calendarEvents || [] : [],
    driveFiles: driveResponse.result || [],
    refetchCalendarEvents: calendarResponse.execute,
    refetchDriveFiles: driveResponse.execute,
    lastUpdated: new Date(),
    emailAddresses: emailList,
  };
};

export default FetchFirst;
