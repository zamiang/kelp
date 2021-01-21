import { addDays, addMinutes, getDay, setDay, setHours } from 'date-fns';
import Faker from 'faker';
import { random, sample, sampleSize, times } from 'lodash';
import { getSelfResponseStatus } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import DocumentDataStore, { IDocument } from './document-store';
import DriveActivityDataStore from './drive-activity-store';
import PersonDataStore, { IPerson } from './person-store';
import TfidfDataStore from './tfidf-store';
import TimeDataStore, { ISegment, getStateForMeeting } from './time-store';
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
    iconLink:
      'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document',
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
      time: addMinutes(startDate, 10),
      action: 'comment',
      actorPersonId: people[random(0, people.length - 1)].id,
      title: Faker.lorem.lines(1),
      link: document.id,
    });
  });
});

times(WEEKS_TO_CREATE, (week: number) => {
  let date = setDay(startDate, DAYS_IN_WEEK * week);
  times(DAYS_IN_WEEK, () => {
    date = setHours(addDays(date, 1), START_HOUR);
    times(Math.round(Math.random() * NUMBER_OF_MEETINGS), () => {
      const currentDayOfWeek = getDay(date);
      if (currentDayOfWeek > 5 || currentDayOfWeek < 1) {
        return;
      }
      date = addMinutes(date, 30);
      const endDate = addMinutes(date, 30);
      const attendees = sampleSize(people, Math.round(Math.random() * NUMBER_OF_ATTENDEES))
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

      const formattedAttendees = attendees.map((attendee) => ({
        personId: attendee.email, // TODO: Simulate google person ids
        self: attendee.self,
        responseStatus: attendee.responseStatus,
      }));

      segments.push({
        id: Faker.random.uuid(),
        link: Faker.internet.url(),
        summary: `${Faker.commerce.productName()} meeting`,
        description: Faker.lorem.paragraphs(3),
        start: date,
        end: endDate,
        attendees,
        formattedAttendees,
        documentIdsFromDescription: [],
        creator: {
          email: sample(people)?.emailAddresses[0],
        },
        organizer: {
          email: sample(people)?.emailAddresses[0],
        },
        selfResponseStatus: getSelfResponseStatus(attendees),
        state: getStateForMeeting({ start: startDate, end: endDate }),
        driveActivityIds: [],
        attendeeDriveActivityIds: [],
        currentUserDriveActivityIds: [],
      });
    });
  });
});

const useFakeStore = (): IStore => {
  const personDataStore = new PersonDataStore(people, [], {
    contactsByEmail: {},
    contactsByPeopleId: {},
  });
  personDataStore.addDriveActivityToStore(driveActivity);
  personDataStore.addGoogleCalendarEventsIdsToStore(segments);

  const timeDataStore = new TimeDataStore(segments, personDataStore);
  timeDataStore.addDriveActivityToStore(driveActivity, personDataStore);
  const documentDataStore = new DocumentDataStore(documents);
  const driveActivityDataStore = new DriveActivityDataStore(driveActivity);

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
