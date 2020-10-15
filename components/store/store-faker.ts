import { addMinutes, subMinutes } from 'date-fns';
import Faker from 'faker';
import { random, sample, sampleSize, times } from 'lodash';
import { getSelfResponseStatus } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { formattedEmail } from '../fetch/fetch-emails';
import { IDoc } from './doc-store';
import { IPerson } from './person-store';
import { ISegment, getStateForMeeting } from './time-store';

const PEOPLE_COUNT = 10;
const EMAIL_THREAD_COUNT = 10;
const EMAIL_COUNT = 0;
const DOCUMENT_COUNT = 50;
const CURRENT_USER_EMAIL = 'brennanmoore@gmail.com';
const NUMBER_OF_MEETINGS = 16;
const NUMBER_OF_DRIVE_ACTIVITY = 20;
/**
 * create name/email pairs to be used across the fake data
 */
const people: IPerson[] = [];
times(PEOPLE_COUNT, () => {
  const name = Faker.name.findName();
  const emailAddress = Faker.internet.email(name).toLowerCase();
  people.push({
    id: emailAddress,
    emailAddress,
    name,
    imageUrl: Faker.image.imageUrl(32, 32, 'people', true, true),
    isMissingProfile: false,
    isCurrentUser: false,
    emailIds: [],
    driveActivityIds: [],
    segmentIds: [],
  });
});

// add current user
people.push({
  id: CURRENT_USER_EMAIL,
  emailAddress: CURRENT_USER_EMAIL,
  name: 'current user',
  imageUrl: Faker.image.imageUrl(32, 32, 'people', true, true),
  isMissingProfile: false,
  isCurrentUser: true,
  emailIds: [],
  driveActivityIds: [],
  segmentIds: [],
});

/**
 * create 50 emails over the past day
 */
const threadIds: string[] = [];
times(EMAIL_THREAD_COUNT, () => {
  threadIds.push(Faker.random.uuid());
});

const emails: formattedEmail[] = times(EMAIL_COUNT, () => ({
  id: Faker.random.uuid(),
  snippet: Faker.lorem.paragraphs(2),
  threadId: sample(threadIds)!,
  date: Faker.date.recent(1),
  subject: Faker.lorem.lines(1),
  isImportant: Faker.random.boolean(),
  labelIds: [],
  from: sample(people)!.emailAddress!,
  to: [sample(people)!.emailAddress!],
}));

/**
 * create 10 documents
 */
const documents: IDoc[] = times(DOCUMENT_COUNT, () => ({
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

/**
 * create 10 drive activity per document
 */
const driveActivity: IFormattedDriveActivity[] = [];
documents.map((document) => {
  times(NUMBER_OF_DRIVE_ACTIVITY, () => {
    driveActivity.push({
      id: Faker.random.uuid(),
      time: Faker.date.recent(1),
      action: 'comment', // TODO
      actorPersonId: people[random(0, PEOPLE_COUNT)].id, // TODO use person id
      title: Faker.lorem.lines(1),
      link: document.id,
    });
  });
});

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
let startDate = new Date(new Date().setHours(17));
const segments: ISegment[] = times(NUMBER_OF_MEETINGS, () => {
  startDate = subMinutes(startDate, 30);

  const attendees = sampleSize(people, 5)
    .filter((person) => person.emailAddress !== CURRENT_USER_EMAIL)
    .map((person) => ({
      email: person.emailAddress,
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
    personId: attendee.email!, // TODO: Simulate google person ids
    self: attendee.self,
    responseStatus: attendee.responseStatus,
  }));
  const endDate = addMinutes(startDate, 30);
  return {
    id: Faker.random.uuid(),
    link: Faker.internet.url(),
    summary: `${Faker.commerce.productName()} meeting`,
    description: Faker.lorem.paragraphs(3),
    start: startDate,
    end: endDate,
    attendees,
    formattedAttendees,
    creator: {
      email: sample(people)?.emailAddress,
    },
    organizer: {
      email: sample(people)?.emailAddress,
    },
    selfResponseStatus: getSelfResponseStatus(attendees),
    state: getStateForMeeting({ start: startDate, end: endDate }),
    driveActivityIds: [],
    emailIds: [],
  };
});

export default { people, documents, segments, emails, driveActivity };
