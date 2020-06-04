import React from 'react';
import Dashboard from './dashboard';
import { IProps as FetchProps, formattedEmail } from './fetch-second';
import PersonDataStore from './person-store';
import TimeDataStore from './time-store';

interface IProps extends FetchProps {
  emails?: formattedEmail[];
}

const FormatData = (props: IProps) => {
  const personDataStore = new PersonDataStore(props.personList, props.emailList);

  personDataStore.addEmailsToStore(props.emails || []);
  personDataStore.addDriveActivityToStore(props.driveActivity);
  personDataStore.addCalendarEventsToStore(props.calendarEvents || []);

  console.log('PERSON DATA STORE:', personDataStore);
  const timeDataStore = new TimeDataStore(props.calendarEvents || []);
  timeDataStore.addEmailsToStore(props.emails || []);
  timeDataStore.addDriveActivityToStore(props.driveActivity);

  console.log('TIME DATA STORE:', timeDataStore);

  return (
    <Dashboard
      classes={props.classes}
      timeDataStore={timeDataStore}
      personDataStore={personDataStore}
    />
  );
};

export default FormatData;
