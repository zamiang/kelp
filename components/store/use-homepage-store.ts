import { addMinutes } from 'date-fns';
import Faker from 'faker';
import { random, times } from 'lodash';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import DocumentDataStore, { IDocument } from './document-store';
import DriveActivityDataStore from './drive-activity-store';
import PersonDataStore, { IPerson } from './person-store';
import TfidfDataStore from './tfidf-store';
import TimeDataStore, { ISegment, getStateForMeeting } from './time-store';
import { IStore } from './use-store';

export const meetingId = 'meeting-id';
const NUMBER_OF_DRIVE_ACTIVITY = 5;
const DAYS_IN_WEEK = 7;
const WEEKS_TO_CREATE = 3;
const CURRENT_USER_EMAIL = 'ghengis.khan@gmail.com';

const people: IPerson[] = [
  {
    id: 'ghengis.khan@gmail.com',
    emailAddresses: ['ghengis.khan@gmail.com'],
    name: 'Genghis Khan',
    imageUrl: '',
    isInContacsts: true,
    googleId: null,
    isCurrentUser: true,
    driveActivity: {},
    segmentIds: [],
  },
  {
    id: 'ramesses.ii@gmail.com',
    emailAddresses: ['ramesses.ii@gmail.com'],
    name: 'Ramesses II',
    imageUrl: '',
    isInContacsts: true,
    googleId: null,
    isCurrentUser: false,
    driveActivity: {},
    segmentIds: [],
  },
  {
    id: 'alexander.the.great@gmail.com',
    emailAddresses: ['alexander.the.great@gmail.com'],
    name: 'Alexander the Great',
    imageUrl: '',
    isInContacsts: true,
    googleId: null,
    isCurrentUser: false,
    driveActivity: {},
    segmentIds: [],
  },
  {
    id: 'shaka@gmail.com',
    emailAddresses: ['shaka@gmail.com'],
    name: 'Shaka',
    imageUrl: '',
    isInContacsts: true,
    googleId: null,
    isCurrentUser: false,
    driveActivity: {},
    segmentIds: [],
  },
];

const documents: IDocument[] = [
  {
    id: Faker.random.uuid(),
    name: 'SPAC Formataion to acquire Roman Empire [notes]',
    viewedByMe: true,
    viewedByMeAt: new Date(Faker.date.recent(1).toISOString()),
    link: Faker.internet.url(),
    iconLink: Faker.image.imageUrl(32, 32, 'abstract', true, true),
    mimeType: 'UNKNOWN',
    isShared: true,
    isStarred: true,
    updatedAt: new Date(Faker.date.recent(1).toISOString()),
  },
];

const attendees = people.map((person) => ({
  email: person.emailAddresses[0],
  self: person.emailAddresses[0] !== CURRENT_USER_EMAIL,
  // Adds accepted many times to weight it higher in the sample
  responseStatus: 'accepted',
}));
const formattedAttendees = attendees.map((attendee) => ({
  personId: attendee.email, // TODO: Simulate google person ids
  self: attendee.self,
  responseStatus: attendee.responseStatus,
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
    formattedAttendees,
    documentIdsFromDescription: [],
    creator: {
      email: people[0].emailAddresses[0],
    },
    organizer: {
      email: people[0].emailAddresses[0],
    },
    selfResponseStatus: 'accepted',
    state: getStateForMeeting({ start: startDate, end: endDate }),
    driveActivityIds: [],
    attendeeDriveActivityIds: [],
    currentUserDriveActivityIds: [],
  },
];

const driveActivity: IFormattedDriveActivity[] = [];
documents.map((document) => {
  times(Math.round(Math.random() * NUMBER_OF_DRIVE_ACTIVITY), () => {
    driveActivity.push({
      id: Faker.random.uuid(),
      time: Faker.date.recent(DAYS_IN_WEEK * WEEKS_TO_CREATE),
      action: 'comment', // TODO
      actorPersonId: people[random(0, people.length - 1)].id, // TODO use person id
      title: Faker.lorem.lines(1),
      link: document.id,
    });
  });
});

const useFakeStore = (): IStore => {
  // TODO: Only create the datastores once data.isLoading is false
  const personDataStore = new PersonDataStore(people, [], {
    contactsByEmail: {},
    contactsByPeopleId: {},
  });
  // personDataStore.addEmailsToStore(data.emails || []);
  personDataStore.addDriveActivityToStore(driveActivity);
  personDataStore.addGoogleCalendarEventsIdsToStore(segments);
  // personDataStore.addCurrentUserFlag(data.calendarEvents);
  // console.log('PERSON DATA STORE:', personDataStore);

  const timeDataStore = new TimeDataStore(segments, personDataStore);
  // timeDataStore.addEmailsToStore(data.emails);
  timeDataStore.addDriveActivityToStore(driveActivity, personDataStore);
  // console.log('TIME DATA STORE:', timeDataStore);

  const documentDataStore = new DocumentDataStore(documents);
  // console.log('DOC DATA STORE:', DocumentDataStore);

  const driveActivityDataStore = new DriveActivityDataStore(driveActivity);
  // console.log('DRIVE ACTIVITY DATA STORE:', driveActivityDataStore);

  const tfidfStore = new TfidfDataStore(
    {
      driveActivityStore: driveActivityDataStore,
      timeDataStore,
      personDataStore,
      documentDataStore,
    },
    { meetings: true, people: true, docs: true },
  );

  return {
    driveActivityStore: driveActivityDataStore,
    timeDataStore,
    personDataStore,
    documentDataStore,
    tfidfStore,
    lastUpdated: new Date(),
    refetch: () => null,
  };
};

export default useFakeStore;
