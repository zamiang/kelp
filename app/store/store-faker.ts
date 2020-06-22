import { addMinutes, subMinutes } from 'date-fns';
import Faker from 'faker';
import { random, times } from 'lodash';
import { IFormattedDriveActivity } from '../fetch/fetch-first';
import { formattedEmail } from '../fetch/fetch-second';
import { IDoc } from './doc-store';
import { IPerson } from './person-store';
import { ISegment } from './time-store';

const PEOPLE_COUNT = 10;
const EMAIL_THREAD_COUNT = 10;
const EMAIL_COUNT = 50;
const DOCUMENT_COUNT = 10;

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
    imageUrl: Faker.image.avatar(),
    emailIds: [],
    driveActivityIds: [],
    segmentIds: [],
  });
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
  threadId: threadIds[random(0, EMAIL_THREAD_COUNT - 1)],
  date: Faker.date.recent(1),
  subject: Faker.lorem.lines(1),
  from: people[random(0, PEOPLE_COUNT - 1)].emailAddress,
  to: [people[random(0, PEOPLE_COUNT - 1)].emailAddress],
}));

/**
 * create 10 documents
 */
const documents: IDoc[] = times(DOCUMENT_COUNT, () => ({
  id: Faker.random.uuid(),
  name: Faker.system.fileName(),
  description: Faker.lorem.lines(1),
  viewedByMe: true,
  link: Faker.internet.url(),
  updatedAt: Faker.date.recent(1).toISOString(),
}));

/**
 * create 10 drive activity per document
 */
const driveActivity: IFormattedDriveActivity[] = [];
documents.map((document) => {
  times(10, () => {
    driveActivity.push({
      id: Faker.random.uuid(),
      time: Faker.date.recent(1),
      action: 'comment', // TODO
      actorPersonId: people[random(0, PEOPLE_COUNT - 1)].emailAddress, // TODO use person id
      title: Faker.lorem.lines(1),
      link: document.id, // document.link,
    });
  });
});

/**
 * 24 thirty minute meetings back to back
 * Cover the entire day - 'Faker.date.recent(1)`
 */
let startDate = addMinutes(new Date(), 300);
const segments: ISegment[] = times(24, () => {
  startDate = subMinutes(startDate, 30);
  return {
    id: Faker.random.uuid(),
    link: Faker.internet.url(),
    summary: `${Faker.commerce.productName()} meeting`,
    description: Faker.lorem.paragraphs(3),
    start: startDate,
    end: addMinutes(startDate, 30),
    attendees: people.map((person) => ({
      email: person.emailAddress,
      self: false,
    })),
    driveActivityIds: [],
    emailIds: [],
  };
});

export default { people, documents, segments, emails, driveActivity };
