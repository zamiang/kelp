import { ICalendarEvent, IFormattedDriveActivity, person } from '../fetch/fetch-first';
import { formattedEmail } from '../fetch/fetch-second';

export interface IPerson {
  id: string;
  name?: string;
  emailAddress: string;
  imageUrl?: string | null;
  emails: formattedEmail[];
  driveActivity: IFormattedDriveActivity[];
  calendarEvents: ICalendarEvent[];
}

interface IPersonByEmail {
  [email: string]: IPerson;
}

// handle one person w/ multiple email addresses
const createNewPersonFromPerson = (person: person) => ({
  id: person.id,
  name: person.name,
  emailAddress: person.emailAddress.toLocaleLowerCase(),
  imageUrl: person.imageUrl,
  emails: [],
  driveActivity: [],
  calendarEvents: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  emailAddress: email,
  imageUrl: null,
  emails: [],
  driveActivity: [],
  calendarEvents: [],
});

export default class PersonDataStore {
  private personByEmail: IPersonByEmail;
  private personById: IPersonByEmail;

  constructor(personList: person[], emailList: string[]) {
    console.warn('setting up person store');
    this.personByEmail = {};
    this.personById = {};

    this.addPeopleToStore(personList);
    this.addEmailAddressessToStore(emailList);
  }

  addPeopleToStore(people: person[]) {
    people.forEach((person) => {
      const newPerson = createNewPersonFromPerson(person);
      this.personByEmail[person.emailAddress.toLocaleLowerCase()] = newPerson;
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

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    (driveActivity || []).map((driveActivity) => {
      const personById =
        driveActivity.actorPersonId && this.personById[driveActivity.actorPersonId];
      if (personById) {
        personById.driveActivity.push(driveActivity);
        this.personByEmail[personById.emailAddress].driveActivity.push(driveActivity);
      }
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
