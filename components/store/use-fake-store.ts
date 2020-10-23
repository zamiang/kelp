import DocDataStore from './doc-store';
import DriveActivityDataStore from './drive-activity-store';
import EmailDataStore from './email-store';
import PersonDataStore from './person-store';
import data from './store-faker';
import TfidfDataStore from './tfidf-store';
import TimeDataStore from './time-store';
import { IStore } from './use-store';

const useFakeStore = (): IStore => {
  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(data.people, [], {
    contactsByEmail: {},
    contactsByPeopleId: {},
  });
  // personDataStore.addEmailsToStore(data.emails || []);
  personDataStore.addDriveActivityToStore(data.driveActivity);
  personDataStore.addGoogleCalendarEventsIdsToStore(data.segments);
  // personDataStore.addCurrentUserFlag(data.calendarEvents);
  // console.log('PERSON DATA STORE:', personDataStore);

  const timeDataStore = new TimeDataStore(data.segments, personDataStore);
  // timeDataStore.addEmailsToStore(data.emails);
  timeDataStore.addDriveActivityToStore(data.driveActivity);
  // console.log('TIME DATA STORE:', timeDataStore);

  const docDataStore = new DocDataStore(data.documents);
  // console.log('DOC DATA STORE:', docDataStore);

  const driveActivityDataStore = new DriveActivityDataStore(data.driveActivity);
  // console.log('DRIVE ACTIVITY DATA STORE:', driveActivityDataStore);

  const emailDataStore = new EmailDataStore(data.emails, personDataStore);
  // console.log('EMAIL DATA STORE:', emailDataStore);

  const tfidfStore = new TfidfDataStore({
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    docDataStore,
  });

  return {
    driveActivityStore: driveActivityDataStore,
    emailDataStore,
    timeDataStore,
    personDataStore,
    docDataStore,
    tfidfStore,
    lastUpdated: new Date(),
    refetch: () => null,
  };
};

export default useFakeStore;
