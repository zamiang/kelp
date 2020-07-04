import { ICalendarEvent } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { formattedEmail } from '../fetch/fetch-emails';
import { person as GooglePerson } from '../fetch/fetch-people';

export interface IPerson {
  id: string;
  name?: string;
  emailAddress: string;
  imageUrl?: string | null;
  emailIds: string[];
  driveActivityIds: string[];
  segmentIds: string[];
}

export interface IPersonById {
  [id: string]: IPerson;
}

interface IEmailAddressToPersonIdHash {
  [emailAddress: string]: string;
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
  private personById: IPersonById;
  private emailAddressToPersonIdHash: IEmailAddressToPersonIdHash;

  constructor(personList: IPerson[], emailAddresses: string[]) {
    console.warn('setting up person store');
    this.personById = {};
    this.emailAddressToPersonIdHash = {};

    this.addPeopleToStore(personList);
    this.addEmailAddressessToStore(emailAddresses);
  }

  getPersonIdForEmailAddress(emailAddress: string) {
    return this.emailAddressToPersonIdHash[emailAddress];
  }

  addPersonToStore(person: IPerson) {
    this.personById[person.id] = person;
    this.emailAddressToPersonIdHash[person.emailAddress.toLocaleLowerCase()] = person.id;
  }

  addPeopleToStore(people: IPerson[]) {
    people.forEach((person) => {
      this.addPersonToStore(person);
    });
  }

  addEmailAddressessToStore(emailAddresses: string[]) {
    emailAddresses.forEach((emailAddress) => {
      const formattedEmailAddress = emailAddress.toLocaleLowerCase();
      const person = this.emailAddressToPersonIdHash[formattedEmailAddress];
      if (!person) {
        this.addPersonToStore(createNewPersonFromEmail(formattedEmailAddress));
      }
    });
  }

  addDriveActivityToStore(driveActivity: IFormattedDriveActivity[]) {
    (driveActivity || []).map((driveActivity) => {
      const person = driveActivity.actorPersonId && this.personById[driveActivity.actorPersonId];
      if (person) {
        person.driveActivityIds.push(driveActivity.id);
      }
    });
  }

  addEmailsToStore(emails: formattedEmail[]) {
    (emails || []).forEach((email) => {
      if (email.from) {
        const personId = this.emailAddressToPersonIdHash[email.from];
        if (personId) {
          this.personById[personId] && this.personById[personId].emailIds.push(email.id);
        }
      }
      if (email.to) {
        email.to.map((emailTo) => {
          const personId = emailTo && this.emailAddressToPersonIdHash[emailTo];
          if (personId) {
            this.personById[personId] && this.personById[personId].emailIds.push(email.id);
          }
        });
      }
    });
  }

  addGoogleCalendarEventsIdsToStore(events: ICalendarEvent[]) {
    events.forEach((event) => {
      (event.attendees || []).forEach((attendee) => {
        if (attendee && attendee.email) {
          const personId = this.emailAddressToPersonIdHash[attendee.email];
          if (personId) {
            this.personById[personId].segmentIds.push(event.id);
          }
        }
      });
    });
  }

  getEmailAddresses() {
    return Object.keys(this.personById);
  }

  getPeople() {
    return Object.values(this.personById);
  }

  getPersonById(id: string): IPerson | undefined {
    return this.personById[id];
  }

  getPersonDisplayName(person: IPerson) {
    return person.name || person.emailAddress;
  }

  getLength() {
    return Object.keys(this.personById).length;
  }
}
