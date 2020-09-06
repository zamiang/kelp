import React from 'react';
import Dashboard from './dashboard';
import FetchAll from './fetch/fetch-all';
import DocDataStore, { formatGoogleDoc } from './store/doc-store';
import DriveActivityDataStore from './store/drive-activity-store';
import EmailDataStore from './store/email-store';
import PersonDataStore, { formatPerson } from './store/person-store';
import TimeDataStore from './store/time-store';

const DashboardContainer = () => {
  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll('access-token');
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

  return (
    <Dashboard
      driveActivityStore={driveActivityDataStore}
      emailStore={emailDataStore}
      timeDataStore={timeDataStore}
      personDataStore={personDataStore}
      docDataStore={docDataStore}
      lastUpdated={data.lastUpdated}
      refetch={data.refetch}
    />
  );
};

export default DashboardContainer;
