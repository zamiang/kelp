import { DriveActivity } from './activity';
import { ICalendarEvent, person } from './fetch-first';
import { formattedEmail } from './fetch-second';

interface IPersonByEmail {
  [email: string]: {
    id: string;
    name?: string;
    emailAddress: string;
    emails: formattedEmail[];
    driveActivity: DriveActivity[];
    calendarEvents: ICalendarEvent[];
  };
}

// handle one person w/ multiple email addresses
const createNewPersonFromPerson = (person: person) => ({
  id: person.id,
  name: person.name,
  emailAddress: person.email.toLocaleLowerCase(),
  emails: [],
  driveActivity: [],
  calendarEvents: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  emailAddress: email,
  emails: [],
  driveActivity: [],
  calendarEvents: [],
});

export default class PersonDataStore {
  private personByEmail: IPersonByEmail;
  private personById: IPersonByEmail;

  constructor() {
    console.warn('setting up data store');
    this.personByEmail = {};
    this.personById = {};
  }

  addPeopleToStore(people: person[]) {
    people.forEach((person) => {
      const newPerson = createNewPersonFromPerson(person);
      this.personByEmail[person.email.toLocaleLowerCase()] = newPerson;
      this.personById[person.id] = newPerson;
    });
  }

  addEmailAddressessToStore(emails: string[]) {
    emails.forEach((email) => {
      const formattedEmail = email.toLocaleLowerCase();
      if (!this.personByEmail[formattedEmail]) {
        this.personByEmail[formattedEmail] = createNewPersonFromEmail(formattedEmail);
      }
    });
  }

  addDriveActivityToStore(driveActivity: DriveActivity[]) {
    (driveActivity || []).map((driveActivity) => {
      (driveActivity.actors || []).map((actor) => {
        if (actor.user && actor.user.knownUser && actor.user.knownUser.personName) {
          const personById = this.personById[actor.user.knownUser.personName];
          if (personById) {
            personById.driveActivity.push(driveActivity);
            this.personByEmail[personById.emailAddress].driveActivity.push(driveActivity);
          }
        }
      });
    });
  }

  addEmailsToStore(emails: formattedEmail[]) {
    (emails || []).forEach((email) => {
      if (email.from) {
        const from = email.from;
        this.personByEmail[from] && this.personByEmail[from].emails.push(email);
      }
      if (email.to) {
        email.to.map(
          (emailTo) =>
            emailTo &&
            this.personByEmail[emailTo] &&
            this.personByEmail[emailTo].emails.push(email),
        );
      }
    });
  }

  addCalendarEventsToStore(events: ICalendarEvent[]) {
    events.forEach((event) => {
      (event.attendees || []).forEach((attendee) => {
        if (attendee && attendee.email) {
          // TODO: Also format the attendees?
          this.personByEmail[attendee.email].calendarEvents.push(event);
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

  getLength() {
    return Object.keys(this.personByEmail).length;
  }
}
