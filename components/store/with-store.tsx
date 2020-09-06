import { useAuth0 } from '@auth0/auth0-react';
import React, { ComponentType, FC } from 'react';
import FetchAll from '../fetch/fetch-all';
import DocDataStore, { formatGoogleDoc } from './doc-store';
import DriveActivityDataStore from './drive-activity-store';
import EmailDataStore from './email-store';
import PersonDataStore, { formatPerson } from './person-store';
import TimeDataStore from './time-store';

interface IUser {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: 'en';
  name: string;
  nickname: string;
  picture: string; // https://lh3.googleusercontent.com/a-/AOh14GjBtaHxjkknpCtJIUVD_Xr8NBSq4mHTlbXAT7Mtjg
  sub: string; // 'google-oauth2|100884430802346698066';
  updated_at: string; // '2020-09-06T21:32:43.712Z';
}

const withStore = <P extends object>(Component: ComponentType<P>): FC<P> => (
  props: P,
): JSX.Element => {
  const user = useAuth0().user as IUser;

  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll(user.email);
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

  // could render a loading spinner thing over the component here

  return (
    <Component
      driveActivityDataStore={driveActivityDataStore}
      emailDataStore={emailDataStore}
      timeDataStore={timeDataStore}
      personDataStore={personDataStore}
      docDataStore={docDataStore}
      lastUpdated={data.lastUpdated}
      refetch={data.refetch}
      {...props}
    />
  );
};

export default withStore;
