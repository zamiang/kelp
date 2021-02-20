import { flatten, uniq } from 'lodash';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import { getDocumentIdsFromCalendarEvents } from '../store/models/segment-model';
import fetchCalendarEvents, { ICalendarEvent } from './fetch-calendar-events';
import fetchContacts from './fetch-contacts';
import fetchDriveActivityForDocumentIds, { IFormattedDriveActivity } from './fetch-drive-activity';
import fetchDriveFiles from './fetch-drive-files';
import FetchMissingGoogleDocs from './fetch-missing-google-docs';
import { batchFetchPeople, person } from './fetch-people';
import { fetchSelf } from './fetch-self';

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

const initialEmailList: string[] = [];

const FetchAll = (googleOauthToken: string): IReturnType => {
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
    (calendarResponse.result?.calendarEvents || []).map((event) =>
      getDocumentIdsFromCalendarEvents(event),
    ),
  ).filter(Boolean);
  const googleDocIds = (driveResponse.result || []).map((file) => file?.id).filter(Boolean);
  const missingGoogleDocIds = uniq(
    potentiallyMissingGoogleDocIds.filter((id) => !googleDocIds.includes(id)),
  );
  const missingGoogleDocs = FetchMissingGoogleDocs({
    missingGoogleDocIds,
    googleOauthToken,
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
    () => fetchDriveActivityForDocumentIds(googleDocIdsToFetchActivity, googleOauthToken),
    [googleDocIdsToFetchActivity.length.toString()] as any, // unsure why this type is a failure
  );
  const driveActivity = driveActivityResponse.result ? driveActivityResponse.result.activity : [];

  /**
   * People
   */
  // Find people who are in drive activity but not in contacts and try to fetch them.
  const contactsByPeopleId = {} as any;
  (contactsResponse.result || []).map((c) => (contactsByPeopleId[c.id] = c));
  const peopleIds = uniq(
    driveActivity
      .map((activity) => activity?.actorPersonId)
      .filter((id) => !!id && !contactsByPeopleId[id]),
  );
  const peopleResponse = useAsyncAbortable(
    () => batchFetchPeople(peopleIds as any, googleOauthToken),
    [peopleIds.length.toString()] as any,
  );
  const formattedPeopleResponse = {
    peopleLoading: peopleResponse.loading,
    peopleError: peopleResponse ? peopleResponse.error : undefined,
    personList: peopleResponse.result ? peopleResponse.result : [],
    refetchPersonList: peopleResponse.execute,
  };

  return {
    driveActivity,
    ...formattedPeopleResponse,
    ...missingGoogleDocs,
    calendarEvents: calendarResponse.result
      ? calendarResponse.result.calendarEvents.filter(Boolean) || []
      : [],
    driveFiles: driveResponse.result ? driveResponse.result.filter(Boolean) : [],
    contacts: contactsResponse.result ? contactsResponse.result.filter(Boolean) : [],
    currentUser: currentUser.result,
    emailAddresses: emailList,
    refetch: async () => {
      await calendarResponse.execute();
      await driveResponse.execute();
      await formattedPeopleResponse.refetchPersonList();
      await missingGoogleDocs.refetchMissingDriveFiles();
    },
    lastUpdated: new Date(),
    currentUserLoading: currentUser.loading,
    driveResponseLoading: driveResponse.loading,
    driveActivityLoading: driveActivityResponse.loading,
    calendarResponseLoading: calendarResponse.loading,
    contactsResponseLoading: contactsResponse.loading,
    isLoading:
      peopleResponse.loading ||
      currentUser.loading ||
      driveResponse.loading ||
      calendarResponse.loading ||
      contactsResponse.loading ||
      driveActivityResponse.loading ||
      formattedPeopleResponse.peopleLoading ||
      missingGoogleDocs.missingGoogleDocsLoading,
    error:
      peopleResponse.error ||
      contactsResponse.error ||
      driveResponse.error ||
      calendarResponse.error ||
      driveActivityResponse.error ||
      formattedPeopleResponse.peopleError ||
      missingGoogleDocs.missingGoogleDocsError,
  };
};

export default FetchAll;
