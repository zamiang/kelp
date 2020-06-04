import React from 'react';
import Dashboard from './dashboard';
import { IProps as FetchProps, formattedEmail } from './fetch-second';
import PersonDataStore from './person-store';

interface IProps extends FetchProps {
  emails?: formattedEmail[];
}

const FormatData = (props: IProps) => {
  const personDataStore = new PersonDataStore();
  personDataStore.addPeopleToStore(props.personList);
  personDataStore.addEmailAddressessToStore(props.emailList);

  personDataStore.addEmailsToStore(props.emails || []);
  personDataStore.addDriveActivityToStore(props.driveActivity);
  personDataStore.addCalendarEventsToStore(props.calendarEvents || []);

  console.log('omg', personDataStore);
  return <Dashboard classes={props.classes} personDataStore={personDataStore} />;
};

export default FormatData;
