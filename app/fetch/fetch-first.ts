import { subDays } from 'date-fns';
import { useState } from 'react';
import { useAsync } from 'react-async-hook';
import fetchCalendarEvents from './fetch-calendar-events';
import fetchDriveFiles from './fetch-drive-files';

export const NUMBER_OF_DAYS_BACK = 7;
export const startDate = subDays(new Date(), NUMBER_OF_DAYS_BACK);

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
    emailAddresses: emailList,
    isLoading: driveResponse.loading && calendarResponse.loading && emailList,
    calendarEvents: calendarResponse.result ? calendarResponse.result.calendarEvents : [],
    driveFiles: driveResponse.result,
    lastUpdated: new Date(),
  };
};

export default FetchFirst;
