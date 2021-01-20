import { addDays, addMinutes, getDay, setDay, setHours } from 'date-fns';
import Faker from 'faker';
import { random, sample, sampleSize, times } from 'lodash';
import { getSelfResponseStatus } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { IDocument } from './document-store';
import { IPerson } from './person-store';
import { ISegment, getStateForMeeting } from './time-store';

const PEOPLE_COUNT = 10;
const DOCUMENT_COUNT = 50;
const CURRENT_USER_EMAIL = 'support@kelp.nyc';
const NUMBER_OF_MEETINGS = 12;
const NUMBER_OF_DRIVE_ACTIVITY = 5;
const NUMBER_OF_ATTENDEES = 6;
/**
 * create name/email pairs to be used across the fake data
 */
const people: IPerson[] = [];
times(PEOPLE_COUNT, () => {
  const name = Faker.name.findName();
  const emailAddress = Faker.internet.email(name).toLowerCase();
  people.push({
    id: emailAddress,
    emailAddresses: [emailAddress],
    name,
    imageUrl: Faker.image.imageUrl(32, 32, 'people', true, true),
    isInContacsts: true,
    googleId: null,
    isCurrentUser: false,
    driveActivity: {},
    segmentIds: [],
  });
});

// add current user
people.push({
  id: CURRENT_USER_EMAIL,
  emailAddresses: [CURRENT_USER_EMAIL],
  name: 'current user',
  googleId: null,
  imageUrl: Faker.image.imageUrl(32, 32, 'people', true, true),
  isInContacsts: true,
  isCurrentUser: true,
  driveActivity: {},
  segmentIds: [],
});

/**
 * create 10 documents
 */
const documents: IDocument[] = times(DOCUMENT_COUNT, () => ({
  id: Faker.random.uuid(),
  name: Faker.system.fileName(),
  viewedByMe: true,
  viewedByMeAt: new Date(Faker.date.recent(1).toISOString()),
  link: Faker.internet.url(),
  iconLink: Faker.image.imageUrl(32, 32, 'abstract', true, true),
  mimeType: 'UNKNOWN',
  isShared: Faker.random.boolean(),
  isStarred: Faker.random.boolean(),
  updatedAt: new Date(Faker.date.recent(1).toISOString()),
}));

const getRandomResponseStatus = () =>
  sample<string>([
    'accepted',
    'accepted',
    'accepted',
    'accepted',
    'accepted',
    'needsAction',
    'declined',
    'tentative',
  ]);

/**
 * thirty minute meetings back to back
 * Cover the entire day - 'Faker.date.recent(1)`
 */

const segments: ISegment[] = [];
const DAYS_IN_WEEK = 7;
const WEEKS_TO_CREATE = 3;
const START_HOUR = 9;
const startDate = setDay(
  new Date(new Date(new Date().setHours(9)).setMinutes(0)),
  -(DAYS_IN_WEEK * WEEKS_TO_CREATE),
);

/**
 * create drive activity per document
 */
const driveActivity: IFormattedDriveActivity[] = [];
documents.map((document) => {
  times(Math.round(Math.random() * NUMBER_OF_DRIVE_ACTIVITY), () => {
    driveActivity.push({
      id: Faker.random.uuid(),
      time: Faker.date.recent(DAYS_IN_WEEK * WEEKS_TO_CREATE),
      action: 'comment', // TODO
      actorPersonId: people[random(0, PEOPLE_COUNT)].id, // TODO use person id
      title: Faker.lorem.lines(1),
      link: document.id,
    });
  });
});

times(WEEKS_TO_CREATE, (week: number) => {
  let date = setDay(startDate, DAYS_IN_WEEK * (week + 1));
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
          responseStatus: getRandomResponseStatus(),
        }));

      attendees.push({
        email: CURRENT_USER_EMAIL,
        self: true,
        // Adds accepted many times to weight it higher in the sample
        responseStatus: getRandomResponseStatus(),
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

export default { people, documents, segments, driveActivity };
