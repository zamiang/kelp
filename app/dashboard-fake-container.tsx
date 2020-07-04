import React from 'react';
import Dashboard from './dashboard';
import DocDataStore from './store/doc-store';
import DriveActivityDataStore from './store/drive-activity-store';
import EmailDataStore from './store/email-store';
import PersonDataStore from './store/person-store';
import data from './store/store-faker';
import TimeDataStore from './store/time-store';

interface IProps {
  accessToken: string;
}

const DashboardFakeContainer = (props: IProps) => {
  console.log(props);
  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(data.people, []);
  personDataStore.addEmailsToStore(data.emails || []);
  personDataStore.addDriveActivityToStore(data.driveActivity);
  personDataStore.addGoogleCalendarEventsIdsToStore(data.segments);
  console.log('PERSON DATA STORE:', personDataStore);

  const timeDataStore = new TimeDataStore(data.segments, personDataStore);
  timeDataStore.addEmailsToStore(data.emails);
  timeDataStore.addDriveActivityToStore(data.driveActivity);
  console.log('TIME DATA STORE:', timeDataStore);

  const docDataStore = new DocDataStore(data.documents);
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
      lastUpdated={new Date()}
    />
  );
};

export default DashboardFakeContainer;
