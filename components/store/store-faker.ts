import { addDays, addMinutes, setDay, setHours } from 'date-fns';
import Faker from 'faker';
import { sample, sampleSize, times } from 'lodash';
import { getSelfResponseStatus, getStateForMeeting } from '../fetch/google/fetch-calendar-events';
import { IDocument, IFormattedDriveActivity, IPerson, ISegment, ITask } from './data-types';

const PEOPLE_COUNT = 10;
const DOCUMENT_COUNT = 20;
const CURRENT_USER_EMAIL = 'support@kelp.nyc';
const NUMBER_OF_MEETINGS = 12;
const NUMBER_OF_DRIVE_ACTIVITY_PER_MEETING = 5;
const NUMBER_OF_ATTENDEES = 4;
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
    isInContacts: true,
    googleId: emailAddress,
    isCurrentUser: 0,
  });
});

const currentUser = {
  id: CURRENT_USER_EMAIL,
  emailAddresses: [CURRENT_USER_EMAIL],
  name: 'You! (current user)',
  googleId: CURRENT_USER_EMAIL,
  imageUrl: Faker.image.imageUrl(32, 32, 'people', true, true),
  isInContacts: true,
  isCurrentUser: 1,
};

people.push(currentUser);

/**
 * create tasks
 */
const defaultListId = Faker.datatype.uuid();
const tasks: ITask[] = times(DOCUMENT_COUNT, () => ({
  id: Faker.datatype.uuid(),
  title: `hire a ${Faker.name.jobType().toLocaleLowerCase()}`,
  listId: defaultListId,
  listName: 'defaultList',
  hidden: false,
  deleted: false,
  status: 'needsAction',
  position: Faker.datatype.number().toString(),
  updatedAt: new Date(Faker.date.recent(1).toISOString()),
}));

/**
 * create documents
 */
const documents: IDocument[] = times(DOCUMENT_COUNT, () => ({
  id: Faker.datatype.uuid(),
  name: Faker.system.fileName(),
  viewedByMe: true,
  viewedByMeAt: new Date(Faker.date.recent(1).toISOString()),
  link: Faker.internet.url(),
  iconLink: Faker.image.imageUrl(32, 32, 'abstract', true, true),
  mimeType: 'UNKNOWN',
  isShared: Faker.datatype.boolean(),
  isStarred: Faker.datatype.boolean(),
  updatedAt: new Date(Faker.date.recent(1).toISOString()),
}));

const getRandomResponseStatus = () =>
  sample<string>(['accepted', 'accepted', 'accepted', 'accepted', 'accepted']);

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

const driveActivity: IFormattedDriveActivity[] = [];

times(WEEKS_TO_CREATE, (week: number) => {
  let date = setDay(startDate, DAYS_IN_WEEK * (week + 1));
  times(DAYS_IN_WEEK, () => {
    date = setHours(addDays(date, 1), START_HOUR);
    times(Math.round(Math.random() * NUMBER_OF_MEETINGS), () => {
      date = addMinutes(date, 30);
      const endDate = addMinutes(date, 30);
      const peopleForAttendees = sampleSize(
        people,
        Math.round(Math.random() * NUMBER_OF_ATTENDEES),
      ).filter((person) => person.emailAddresses[0] !== CURRENT_USER_EMAIL);

      const attendees = peopleForAttendees.map((person) => ({
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

      /**
       * create drive activity per document
       */
      const document = sample(documents);
      times(Math.round(Math.random() * NUMBER_OF_DRIVE_ACTIVITY_PER_MEETING), () => {
        const actor = sample(peopleForAttendees);
        if (actor) {
          driveActivity.push({
            id: Faker.datatype.uuid(),
            time: addMinutes(date, 1),
            action: 'comment', // TODO
            actorPersonId: actor.id,
            title: Faker.lorem.lines(1),
            link: document!.id,
          });
        }
      });

      segments.push({
        id: Faker.datatype.uuid(),
        link: Faker.internet.url(),
        summary: `${Faker.commerce.productName()} meeting`,
        description: Faker.lorem.paragraphs(3),
        start: date,
        end: endDate,
        attendees,
        documentIdsFromDescription: [],
        creator: {
          email: sample(people)?.emailAddresses[0],
        },
        organizer: {
          email: sample(people)?.emailAddresses[0],
        },
        selfResponseStatus: getSelfResponseStatus(attendees),
        state: getStateForMeeting({ start: startDate, end: endDate } as any),
        attachments: [],
      });
    });
  });
});

export default { people, documents, segments, driveActivity, currentUser, tasks };
