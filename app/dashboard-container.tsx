import React from 'react';
import Dashboard from './dashboard';
import FetchAll from './fetch/fetch-all';
import PersonDataStore from './store/person-store';
import TimeDataStore from './store/time-store';

interface IProps {
  accessToken: string;
}

const DashboardContainer = (props: IProps) => {
  // TODO: Listen for log-out or token espiring and re-fetch
  const data = FetchAll(props.accessToken);

  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(data.personList, data.emailList);
  personDataStore.addEmailsToStore(data.emails || []);
  personDataStore.addDriveActivityToStore(data.driveActivity);
  personDataStore.addCalendarEventsToStore(data.calendarEvents || []);
  console.log('PERSON DATA STORE:', personDataStore);

  const timeDataStore = new TimeDataStore(data.calendarEvents || []);
  timeDataStore.addEmailsToStore(data.emails || []);
  timeDataStore.addDriveActivityToStore(data.driveActivity);
  console.log('TIME DATA STORE:', timeDataStore);

  return <Dashboard timeDataStore={timeDataStore} personDataStore={personDataStore} />;
};

export default DashboardContainer;
