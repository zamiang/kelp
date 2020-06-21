import {
  person as GooglePerson,
  ICalendarEvent,
  IFormattedDriveActivity,
} from '../fetch/fetch-first';
import { formattedEmail } from '../fetch/fetch-second';

export interface IPerson {
  id: string;
  name?: string;
  emailAddress: string;
  imageUrl?: string | null;
  emailIds: string[];
  driveActivityIds: string[];
  segmentIds: string[];
}

interface IPersonByEmail {
  [email: string]: IPerson;
}

// handle one person w/ multiple email addresses
export const formatPerson = (person: GooglePerson) => ({
  id: person.id,
  name: person.name,
  emailAddress: person.emailAddress.toLocaleLowerCase(),
  imageUrl: person.imageUrl,
  emailIds: [],
  driveActivityIds: [],
  segmentIds: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  emailAddress: email,
  imageUrl: null,
  emailIds: [],
  driveActivityIds: [],
  segmentIds: [],
});

export default class PersonDataStore {
  private personByEmail: IPersonByEmail;
  private personById: IPersonByEmail;

  constructor(personList: IPerson[], emailAddresses: string[]) {
    console.warn('setting up person store');
    this.personByEmail = {};
    this.personById = {};

    this.addPeopleToStore(personList);
    this.addEmailAddressessToStore(emailAddresses);
  }

  addPeopleToStore(people: IPerson[]) {
    people.forEach((person) => {
      this.personByEmail[person.emailAddress.toLocaleLowerCase()] = person;
      this.personById[person.id] = person;
    });
  }

  addEmailAddressessToStore(emailAddresses: string[]) {
    emailAddresses.forEach((emailAddress) => {
      const formattedEmailAddress = emailAddress.toLocaleLowerCase();
      if (!this.personByEmail[formattedEmailAddress]) {
        this.personByEmail[formattedEmailAddress] = createNewPersonFromEmail(formattedEmailAddress);
      }
    });
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    (driveActivity || []).map((driveActivity) => {
      const personById =
        driveActivity.actorPersonId && this.personById[driveActivity.actorPersonId];
      if (personById) {
        personById.driveActivityIds.push(driveActivity.id);
        this.personByEmail[personById.emailAddress].driveActivityIds.push(driveActivity.id);
      }
    });
  }

  addEmailsToStore(emails: formattedEmail[]) {
    (emails || []).forEach((email) => {
      if (email.from) {
        const from = email.from;
        this.personByEmail[from] && this.personByEmail[from].emailIds.push(email.id);
      }
      if (email.to) {
        email.to.map(
          (emailTo) =>
            emailTo &&
            this.personByEmail[emailTo] &&
            this.personByEmail[emailTo].emailIds.push(email.id),
        );
      }
    });
  }

  addCalendarEventsToStore(events: ICalendarEvent[]) {
    events.forEach((event) => {
      (event.attendees || []).forEach((attendee) => {
        if (attendee && attendee.email) {
          // TODO: Also format the attendees?
          this.personByEmail[attendee.email].segmentIds.push(event.id);
        }
      });
    });
  }

  getEmailAddresses() {
    return Object.keys(this.personByEmail);
  }

  getPeople() {
    return Object.values(this.personByEmail);
  }

  getPersonByEmail(email: string) {
    return this.personByEmail[email];
  }

  // @param peopleId: person/1313513
  // @deprecated
  getPersonByPeopleId(peopleId: string) {
    console.warn('do not use getPersonByPeopleId - may be inaccurate');
    return this.personById[peopleId];
  }

  getPersonDisplayName(person: IPerson) {
    return person.name || person.emailAddress;
  }

  getLength() {
    return Object.keys(this.personByEmail).length;
  }
}
