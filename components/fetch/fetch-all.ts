import { flatten, uniq } from 'lodash';
import { getDocumentIdsFromCalendarEvents } from '../store/models/segment-model';
import { ICalendarEvent } from './fetch-calendar-events';
import { IFormattedDriveActivity } from './fetch-drive-activity';
import FetchFirst from './fetch-first';
import FetchFourth from './fetch-fourth';
import { person } from './fetch-people';
import FetchSecond from './fetch-second';
import FetchThird from './fetch-third';

interface IReturnType {
  readonly personList: person[];
  readonly emailAddresses: string[];
  readonly contacts: person[];
  readonly currentUser?: person;
  readonly calendarEvents: ICalendarEvent[];
  readonly driveFiles: gapi.client.drive.File[];
  readonly missingDriveFiles: (gapi.client.drive.File | null)[];
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
}

// Our hook
/*
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
*/

const FetchAll = (googleOauthToken: string): IReturnType => {
  const firstLayer = FetchFirst(googleOauthToken);

  // Find documents that are in meeting descriptions and make sure to fetch them as well
  const potentiallyMissingGoogleDocIds = flatten(
    firstLayer.calendarEvents.map((event) => getDocumentIdsFromCalendarEvents(event)),
  ).filter(Boolean);
  const googleDocIds = firstLayer.driveFiles.map((file) => file.id!);
  const missingGoogleDocIds = uniq(
    potentiallyMissingGoogleDocIds.filter((id) => !googleDocIds.includes(id)),
  );
  const secondLayer = FetchSecond({
    googleDocIds: googleDocIds.concat(missingGoogleDocIds),
    googleOauthToken,
  });

  // Find people who are in drive activity but not in contacts and try to fetch them.
  const contactsByPeopleId = {} as any;
  firstLayer.contacts.map((c) => (contactsByPeopleId[c.id] = c));
  const peopleIds = uniq(
    secondLayer.driveActivity
      .map((activity) => activity.actorPersonId!)
      .filter((id) => !!id && !contactsByPeopleId[id]),
  );

  const thirdLayer = FetchThird({
    peopleIds,
    googleOauthToken,
  });

  const fourthLayer = FetchFourth({
    missingGoogleDocIds,
    googleOauthToken,
  });

  return {
    ...firstLayer,
    ...secondLayer,
    ...thirdLayer,
    ...fourthLayer,
    refetch: async () => {
      await firstLayer.refetchCalendarEvents();
      await firstLayer.refetchDriveFiles();
      await thirdLayer.refetchPersonList();
      await fourthLayer.refetchMissingDriveFiles();
    },
    isLoading:
      firstLayer.isLoading ||
      secondLayer.driveActivityLoading ||
      thirdLayer.peopleLoading ||
      fourthLayer.missingGoogleDocsLoading, // debouncedIsLoading,
    error: firstLayer.error || secondLayer.error || thirdLayer.error || fourthLayer.error,
  };
};

export default FetchAll;
