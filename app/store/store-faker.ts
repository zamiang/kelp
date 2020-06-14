import { addMinutes, subMinutes } from 'date-fns';
import Faker from 'faker';
import { times } from 'lodash';
import { formattedEmail } from '../fetch/fetch-second';
import { IDoc } from './doc-store';
import { IPerson } from './person-store';
import { ISegment } from './time-store';

interface INameEmailPair {
  name: string;
  email: string;
}

const nameEmailPairs: INameEmailPair[] = [];

times(10, () => {
  const name = Faker.name.findName();
  nameEmailPairs.push({
    name,
    email: Faker.internet.email(name),
  });
});

const emails: formattedEmail[] = [];

const getEmailIdsForEmailAddress = (emailAddress: string) =>
  emails.filter((email) => email.from === emailAddress).map((email) => email.id);
const getRandomDriveActivityIds = () => [];
const getRandomSegmentIds = () => [];

const people: IPerson[] = nameEmailPairs.map((nameEmailPair) => ({
  id: nameEmailPair.email,
  name: nameEmailPair.name,
  imageUrl: Faker.image.avatar(),
  emailAddress: nameEmailPair.email,
  emailIds: getEmailIdsForEmailAddress(nameEmailPair.email),
  driveActivityIds: getRandomDriveActivityIds(),
  segmentIds: getRandomSegmentIds(),
}));

const documents: IDoc[] = times(10, () => ({
  id: Faker.random.uuid(),
  name: Faker.system.fileName(),
  description: undefined,
  viewedByMe: true,
  link: Faker.internet.url(),
  updatedAt: Faker.date.recent().toISOString(),
}));

/**
 * 10 thirty minute meetings back to back
 */
let startDate = addMinutes(new Date(), 30);
const segments: ISegment[] = times(10, () => {
  startDate = subMinutes(startDate, 30);
  return {
    id: Faker.random.uuid(),
    link: Faker.internet.url(),
    summary: `${Faker.commerce.productName()} meeting`,
    start: addMinutes(startDate, 30),
    end: startDate,
    attendees: nameEmailPairs.map((pair) => ({
      email: pair.email,
      self: false,
    })),
    driveActivityIds: [],
    emailIds: [],
  };
});

export default { people, documents, segments };
