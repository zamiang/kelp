import { useAuth0 } from '@auth0/auth0-react';
import React, { ComponentType, FC } from 'react';
import FetchAll from '../fetch/fetch-all';
import DocDataStore, { formatGoogleDoc } from './doc-store';
import DriveActivityDataStore from './drive-activity-store';
import EmailDataStore from './email-store';
import PersonDataStore, { formatPerson } from './person-store';
import TimeDataStore from './time-store';

const withStore = <P extends object>(Component: ComponentType<P>): FC<P> => (
  props: P,
): JSX.Element => {
  const { user } = useAuth0();
  console.log(user, '<<<<<<<<< user');

  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll(user.id);
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
