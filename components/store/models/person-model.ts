import { first } from 'lodash';
import { ICalendarEvent } from '../../fetch/fetch-calendar-events';
import { person as GooglePerson } from '../../fetch/fetch-people';
import { dbType } from '../db';

export interface IPerson {
  id: string;
  name: string;
  emailAddresses: string[];
  imageUrl?: string | null;
  notes?: string;
  googleId: string | null;
  isCurrentUser: number; // needs to be a number to be a valid index
  isInContacts: boolean;
}

export const formatPerson = (person: GooglePerson) => ({
  id: person.id.replace('people/', ''),
  name: person.name,
  googleId: person.id,
  emailAddresses: person.emailAddresses,
  imageUrl: person.imageUrl,
  isCurrentUser: 0,
  isInContacts: person.isInContacts,
  notes: person.notes,
});

const createNewPersonFromEmail = (email: string): IPerson => ({
  id: email,
  name: email,
  googleId: null,
  emailAddresses: [email],
  imageUrl: null,
  isCurrentUser: 0,
  isInContacts: false,
});

const formatPersonForStore = (person: IPerson) => ({
  ...person,
  id: person.id.replace('people/', ''),
});

export default class PersonModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addPeopleToStore(
    people: IPerson[],
    contacts: GooglePerson[] = [],
    emailAddresses: string[] = [],
    events: ICalendarEvent[] = [],
  ) {
    const tx = this.db.transaction('person', 'readwrite');
    const emailAddressToPersonIdHash: any = {};
    const contactLookup: any = {};
    const filteredPeople: IPerson[] = [];
    // Create contact lookup
    contacts.forEach((contact) => {
      contact.emailAddresses.map((email) => {
        contactLookup[email] = contact;
      });
      contactLookup[contact.id] = contact;
    });

    // Add people first
    people.forEach((person) => {
      let isInStore = false;
      person.emailAddresses.map((email) => {
        if (emailAddressToPersonIdHash[email]) {
          isInStore = true;
        } else {
          person.emailAddresses.map((email) => {
            emailAddressToPersonIdHash[email] = person.id;
          });
        }
      });
      if (!isInStore) {
        filteredPeople.push(formatPersonForStore(person));
      }
    });

    // Add email addresses
    emailAddresses.forEach((emailAddress) => {
      const formattedEmailAddress = emailAddress.toLocaleLowerCase();
      const person = emailAddressToPersonIdHash[formattedEmailAddress];
      if (!person) {
        if (contactLookup[formattedEmailAddress]) {
          filteredPeople.push(contactLookup[formattedEmailAddress]);
        } else {
          filteredPeople.push(createNewPersonFromEmail(formattedEmailAddress));
        }
      }
    });

    // get current user email
    (events[0]?.attendees || []).forEach((attendee) => {
      if (attendee && attendee.self && attendee.email) {
        const person = contactLookup[attendee.email];
        person.isCurrentUser = 1;
        filteredPeople.push(person);
      }
    });

    await Promise.all(filteredPeople.map((person) => tx.store.put(person)));
    return tx.done;
  }

  async getAll(shouldExcludeSelf: boolean) {
    const people = await this.db.getAll('person');
    return people.filter((person) => (shouldExcludeSelf ? !person?.isCurrentUser : true));
  }

  async getSelf(): Promise<IPerson | undefined> {
    const currentUser = await this.db.getAllFromIndex('person', 'is-self', 'true');
    return first(currentUser);
  }

  async getPersonById(id: string): Promise<IPerson | undefined> {
    if (id) {
      return this.db.get('person', id.replace('people/', ''));
    }
    return undefined;
  }

  async getPersonIdForEmailAddress(emailAddress: string) {
    const person = await this.db.getFromIndex('person', 'by-email', emailAddress);
    return person?.id;
  }
}
