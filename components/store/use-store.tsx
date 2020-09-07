import { useEffect, useState } from 'react';
import FetchAll from '../fetch/fetch-all';
import DocDataStore, { formatGoogleDoc } from './doc-store';
import DriveActivityDataStore from './drive-activity-store';
import EmailDataStore from './email-store';
import PersonDataStore, { formatPerson } from './person-store';
import TimeDataStore from './time-store';
import useAccessToken from './use-access-token';

const useStore = () => {
  const accessToken = useAccessToken();
  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll(accessToken);
  const people = data.personList.map((person) => formatPerson(person));

  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(people, data.emailAddresses);
  personDataStore.addEmailsToStore(data.emails || []);
  personDataStore.addDriveActivityToStore(data.driveActivity);
  personDataStore.addGoogleCalendarEventsIdsToStore(data.calendarEvents || []);
  console.log('PERSON DATA STORE:', personDataStore);

  const timeDataStore = new TimeDataStore(data.calendarEvents || [], personDataStore);
  timeDataStore.addEmailsToStore(data.emails || []);
  timeDataStore.addDriveActivityToStore(data.driveActivity);
  console.log('TIME DATA STORE:', timeDataStore);

  const docs = (data.driveFiles || []).map((doc) => formatGoogleDoc(doc));
  const docDataStore = new DocDataStore(docs);
  console.log('DOC DATA STORE:', docDataStore);

  const driveActivityDataStore = new DriveActivityDataStore(data.driveActivity);
  console.log('DRIVE ACTIVITY DATA STORE:', driveActivityDataStore);

  const emailDataStore = new EmailDataStore(data.emails, personDataStore);
  console.log('EMAIL DATA STORE:', emailDataStore);

  return {};
};

export default useStore;
