import { DriveActivity } from './activity';
import { person } from './fetch-first';
import { formattedEmail } from './fetch-second';

interface IPersonByEmail {
  [email: string]: {
    id: string;
    name?: string;
    emailAddress: string;
    emails: formattedEmail[];
    driveActivity: DriveActivity[];
  };
}

const createNewPersonFromPerson = (person: person) => ({
  id: person.id,
  name: person.name,
  emailAddress: person.email.toLocaleLowerCase(),
  emails: [],
  driveActivity: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  emailAddress: email,
  emails: [],
  driveActivity: [],
});

export default class PersonDataStore {
  private personByEmail: IPersonByEmail = {};
  private personById: IPersonByEmail = {};

  constructor() {
    console.warn('setting up data store');
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
          personById.driveActivity.push(driveActivity);
          this.personByEmail[personById.emailAddress].driveActivity.push(driveActivity);
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
        email.to.map((emailTo) => emailTo && this.personByEmail[emailTo].emails.push(email));
      }
    });
  }

  getLength() {
    return Object.keys(this.personByEmail).length;
  }
}
