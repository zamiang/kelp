import { addDays, addMinutes, getDay, setDay, setHours } from 'date-fns';
import Faker from 'faker';
import { sampleSize, times } from 'lodash';
import { getSelfResponseStatus } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { dbType } from './db';
import AttendeeDataStore from './models/attendee-model';
import DocumentDataStore, { IDocument } from './models/document-model';
import DriveActivityDataStore from './models/drive-activity-model';
import PersonDataStore, { IPerson } from './models/person-model';
import TimeDataStore, { ISegment, getStateForMeeting } from './models/segment-model';
import TfidfDataStore from './models/tfidf-model';
import { IStore } from './use-store';

Faker.seed(124);

export const meetingId = 'meeting-id';
const NUMBER_OF_DRIVE_ACTIVITY = 5;
const DAYS_IN_WEEK = 7;
const WEEKS_TO_CREATE = 1;
const CURRENT_USER_EMAIL = 'ghengis.khan@gmail.com';
const NUMBER_OF_MEETINGS = 12;
const NUMBER_OF_ATTENDEES = 6;
const START_HOUR = 9;

const people: IPerson[] = [
  {
    id: 'ghengis.khan@gmail.com',
    emailAddresses: ['ghengis.khan@gmail.com'],
    name: 'Genghis Khan',
    imageUrl: '',
    isInContacts: true,
    googleId: null,
    isCurrentUser: 1,
  },
  {
    id: 'ramesses.ii@gmail.com',
    emailAddresses: ['ramesses.ii@gmail.com'],
    name: 'Ramesses II',
    imageUrl: '',
    isInContacts: true,
    googleId: null,
    isCurrentUser: 0,
  },
  {
    id: 'alexander.the.great@gmail.com',
    emailAddresses: ['alexander.the.great@gmail.com'],
    name: 'Alexander the Great',
    imageUrl: '',
    isInContacts: true,
    googleId: null,
    isCurrentUser: 0,
  },
  {
    id: 'shaka@gmail.com',
    emailAddresses: ['shaka@gmail.com'],
    name: 'Shaka',
    imageUrl: '',
    isInContacts: true,
    googleId: null,
    isCurrentUser: 0,
  },
];

const documents: IDocument[] = [
  {
    id: Faker.random.uuid(),
    name: 'SPAC Formataion to acquire Roman Empire [notes]',
    viewedByMe: true,
    viewedByMeAt: new Date(),
    link: 'https://www.kelp.nyc',
    iconLink:
      'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
    mimeType: 'UNKNOWN',
    isShared: true,
    isStarred: true,
    updatedAt: new Date(),
  },
];

const attendees = people.map((person) => ({
  email: person.emailAddresses[0],
  self: person.emailAddresses[0] !== CURRENT_USER_EMAIL,
  // Adds accepted many times to weight it higher in the sample
  responseStatus: 'accepted',
}));

export const startDate = new Date(new Date().setMinutes(0));
export const endDate = addMinutes(startDate, 55);

const segments: ISegment[] = [
  {
    id: meetingId,
    link: 'https://www.kelp.nyc',
    summary: 'SPAC Formataion to acquire Roman Empire',
    description: 'Alexander to add notes',
    start: startDate,
    end: endDate,
    attendees,
    documentIdsFromDescription: [],
    creator: {
      email: people[0].emailAddresses[0],
    },
    organizer: {
      email: people[0].emailAddresses[0],
    },
    selfResponseStatus: 'accepted',
    state: getStateForMeeting({ start: startDate, end: endDate }),
  },
];

const driveActivity: IFormattedDriveActivity[] = [];
documents.map((document) => {
  times(NUMBER_OF_DRIVE_ACTIVITY, () => {
    driveActivity.push({
      id: Faker.random.uuid(),
      time: addMinutes(startDate, 10),
      action: 'comment',
      actorPersonId: people[1].id,
      title: Faker.lorem.lines(1),
      link: document.id,
    });
  });
});

times(WEEKS_TO_CREATE, (week: number) => {
  let date = setDay(startDate, DAYS_IN_WEEK * week);
  times(DAYS_IN_WEEK, () => {
    date = setHours(addDays(date, 1), START_HOUR);
    times(NUMBER_OF_MEETINGS, () => {
      const currentDayOfWeek = getDay(date);
      if (currentDayOfWeek > 5 || currentDayOfWeek < 1) {
        return;
      }
      date = addMinutes(date, 30);
      const endDate = addMinutes(date, 30);
      const attendees = sampleSize(people, NUMBER_OF_ATTENDEES)
        .filter((person) => person.emailAddresses[0] !== CURRENT_USER_EMAIL)
        .map((person) => ({
          email: person.emailAddresses[0],
          self: false,
          // Adds accepted many times to weight it higher in the sample
          responseStatus: 'accepted',
        }));

      attendees.push({
        email: CURRENT_USER_EMAIL,
        self: true,
        // Adds accepted many times to weight it higher in the sample
        responseStatus: 'accepted',
      });

      segments.push({
        id: Faker.random.uuid(),
        link: 'https://www.kelp.nyc',
        summary: `${Faker.commerce.productName()} meeting`,
        description: Faker.lorem.paragraphs(3),
        start: date,
        end: endDate,
        attendees,
        documentIdsFromDescription: [],
        creator: {
          email: people[1].emailAddresses[0],
        },
        organizer: {
          email: people[1].emailAddresses[0],
        },
        selfResponseStatus: getSelfResponseStatus(attendees),
        state: getStateForMeeting({ start: startDate, end: endDate }),
      });
    });
  });
});

const useFakeStore = async (db: dbType): Promise<IStore> => {
  const personDataStore = new PersonDataStore(db);
  await personDataStore.addPeopleToStore(people);

  const timeDataStore = new TimeDataStore(db);
  await timeDataStore.addSegments(segments);

  const documentDataStore = new DocumentDataStore(db);
  await documentDataStore.addDocsToStore(documents);

  const driveActivityDataStore = new DriveActivityDataStore(db);
  await driveActivityDataStore.addDriveActivityToStore(driveActivity);

  const attendeeDataStore = new AttendeeDataStore(db);
  await attendeeDataStore.addAttendeesToStore(segments);

  const tfidfStore = new TfidfDataStore(db);
  await tfidfStore.saveDocuments({
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
  });

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    attendeeDataStore,
    tfidfStore,
    isLoading: false,
    lastUpdated: new Date(),
    refetch: () => null,
  };
};

export default useFakeStore;
