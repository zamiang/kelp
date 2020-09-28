import { first, uniq } from 'lodash';
import { ICalendarEvent } from '../fetch/fetch-calendar-events';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { formattedEmail } from '../fetch/fetch-emails';
import { person as GooglePerson } from '../fetch/fetch-people';

export interface IPerson {
  id: string;
  name: string;
  emailAddress?: string;
  imageUrl?: string | null;
  emailIds: string[];
  isCurrentUser: boolean;
  isMissingProfile: boolean;
  driveActivityIds: string[];
  segmentIds: string[];
}

interface IPersonById {
  [id: string]: IPerson;
}

interface IEmailAddressToPersonIdHash {
  [emailAddress: string]: string;
}

// TODO: handle one person w/ multiple email addresses
export const formatPerson = (person: GooglePerson) => ({
  id: person.id.replace('people/', ''),
  name: person.name,
  emailAddress: person.emailAddress?.toLocaleLowerCase(),
  imageUrl: person.imageUrl,
  isCurrentUser: false,
  isMissingProfile: person.isMissingProfile,
  emailIds: [],
  driveActivityIds: [],
  segmentIds: [],
});

const createNewPersonFromEmail = (email: string) => ({
  id: email,
  name: email,
  emailAddress: email,
  imageUrl: null,
  isCurrentUser: false,
  isMissingProfile: false,
  emailIds: [],
  driveActivityIds: [],
  segmentIds: [],
});

interface IContacts {
  contactsByEmail: { [id: string]: GooglePerson };
  contactsByPeopleId: { [id: string]: GooglePerson };
}

export default class PersonDataStore {
  private personById: IPersonById;
  private emailAddressToPersonIdHash: IEmailAddressToPersonIdHash;
  private contacts: IContacts;

  constructor(personList: IPerson[], emailAddresses: string[], contacts: IContacts) {
    // console.warn('setting up person store');
    this.personById = {};
    this.emailAddressToPersonIdHash = {};
    this.contacts = contacts;

    this.addPeopleToStore(personList);
    this.addEmailAddressessToStore(emailAddresses);
  }

  getPersonIdForEmailAddress(emailAddress: string) {
    return this.emailAddressToPersonIdHash[emailAddress];
  }

  addPersonToStore(person: IPerson) {
    if (
      person.emailAddress &&
      this.emailAddressToPersonIdHash[person.emailAddress.toLocaleLowerCase()]
    ) {
      // Already in the store
      return;
    }
    this.personById[person.id.replace('people/', '')] = person;
    if (person.emailAddress) {
      this.emailAddressToPersonIdHash[person.emailAddress.toLocaleLowerCase()] = person.id;
    }
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
        const contact = this.contacts.contactsByEmail[formattedEmailAddress];
        if (contact) {
          this.addPersonToStore(formatPerson(contact));
        } else {
          this.addPersonToStore(createNewPersonFromEmail(formattedEmailAddress));
        }
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
        const formattedEmailAddress = email.from.toLocaleLowerCase();
        const contact = this.contacts.contactsByEmail[formattedEmailAddress];
        if (contact) {
          this.addPersonToStore(formatPerson(contact));
        }
        const personId = this.emailAddressToPersonIdHash[formattedEmailAddress];
        if (personId) {
          this.personById[personId] && this.personById[personId].emailIds.push(email.id);
        }
      }
      if (email.to) {
        email.to.map((emailTo) => {
          if (emailTo) {
            const formattedEmailAddress = emailTo.toLocaleLowerCase();
            const contact = this.contacts.contactsByEmail[formattedEmailAddress];
            if (contact) {
              this.addPersonToStore(formatPerson(contact));
            }
            const personId = emailTo && this.emailAddressToPersonIdHash[emailTo];
            if (personId) {
              this.personById[personId] && this.personById[personId].emailIds.push(email.id);
            }
          }
        });
      }
    });
  }

  addCurrentUserFlag(events: ICalendarEvent[]) {
    (events[0]?.attendees || []).forEach((attendee) => {
      if (attendee && attendee.self) {
        const personId = this.emailAddressToPersonIdHash[attendee.email];
        if (personId) {
          this.personById[personId].isCurrentUser = true;
        }
      }
    });
  }

  addGoogleCalendarEventsIdsToStore(events: ICalendarEvent[]) {
    events.forEach((event) => {
      if (event.creator?.email) {
        const personId = this.emailAddressToPersonIdHash[event.creator.email];
        if (personId) {
          this.personById[personId].segmentIds.push(event.id);
        }
      }
      if (event.organizer?.email) {
        const personId = this.emailAddressToPersonIdHash[event.organizer.email];
        if (personId) {
          this.personById[personId].segmentIds.push(event.id);
        }
      }

      (event.attendees || []).forEach((attendee) => {
        if (attendee && attendee.email) {
          const personId = this.emailAddressToPersonIdHash[attendee.email];
          if (personId) {
            this.personById[personId].segmentIds.push(event.id);
          }
        }
      });
    });
    // There will be many dupes
    this.cleanupDuplicateSegmentIds();
  }

  cleanupDuplicateSegmentIds() {
    this.getPeople().map((person) => (person.segmentIds = uniq(person.segmentIds)));
  }

  getEmailAddresses() {
    return Object.keys(this.personById);
  }

  getPeople() {
    return Object.values(this.personById);
  }

  getSelf(): IPerson | undefined {
    return first(this.getPeople().filter((person) => person.isCurrentUser));
  }

  getPersonById(id: string): IPerson | undefined {
    return this.personById[id.replace('people/', '')];
  }

  getPersonDisplayName(person: IPerson) {
    return person.name;
  }

  getLength() {
    return Object.keys(this.personById).length;
  }
}
