import { uniq } from 'lodash';
import { useEffect, useState } from 'react';
import { ICalendarEvent } from './fetch-calendar-events';
import { IFormattedDriveActivity } from './fetch-drive-activity';
import FetchFirst from './fetch-first';
import { person } from './fetch-people';
import FetchSecond from './fetch-second';
import FetchThird from './fetch-third';

interface IReturnType {
  readonly personList: person[];
  readonly emailAddresses: string[];
  readonly contacts: person[];
  readonly currentUser: person;
  readonly calendarEvents: ICalendarEvent[];
  readonly driveFiles: gapi.client.drive.File[];
  readonly driveActivity: IFormattedDriveActivity[];
  readonly isLoading: boolean;
  readonly refetch: () => void;
  readonly lastUpdated: Date;
  readonly error: Error | undefined;
}

// Our hook
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

const FetchAll = (): IReturnType => {
  const firstLayer = FetchFirst();
  const googleDocIds = firstLayer.driveFiles.map((file) => file.id!);
  const secondLayer = FetchSecond({
    googleDocIds,
    isLoading: firstLayer.isLoading,
  });

  // TODO: This lookup is weird
  const contactsByPeopleId = {} as any;
  firstLayer.contacts.map((c) => (contactsByPeopleId[c.id] = c));
  const peopleIds = uniq(
    secondLayer.driveActivity
      .map((activity) => activity.actorPersonId)
      .filter((id) => !!id && !contactsByPeopleId[id]),
  ) as string[];

  const thirdLayer = FetchThird({
    peopleIds,
  });
  const debouncedIsLoading = useDebounce(
    firstLayer.isLoading || secondLayer.isLoading || thirdLayer.isLoading,
    500,
  );

  return {
    ...firstLayer,
    ...secondLayer,
    ...thirdLayer,
    refetch: async () => {
      await firstLayer.refetchCalendarEvents();
      await firstLayer.refetchDriveFiles();
      await thirdLayer.refetchPersonList();
    },
    isLoading: debouncedIsLoading,
    error: firstLayer.error || secondLayer.error || thirdLayer.error,
  };
};

export default FetchAll;
