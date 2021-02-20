import { first, uniq } from 'lodash';
import { formatContact } from '../../fetch/fetch-contacts';
import { person as GooglePerson, formatGmailAddress } from '../../fetch/fetch-people';
import { dbType } from '../db';

export interface IPerson {
  id: string;
  name: string;
  emailAddresses: string[];
  imageUrl?: string;
  notes?: string;
  googleId?: string;
  isCurrentUser: number; // needs to be a number to be a valid index
  isInContacts: boolean;
}

export const formatPerson = (person: GooglePerson) => ({
  id: person.id,
  name: person.name,
  googleId: person.id,
  emailAddresses: person.emailAddresses,
  imageUrl: person.imageUrl || undefined,
  isCurrentUser: 0,
  isInContacts: person.isInContacts,
  notes: person.notes,
});

const createNewPersonFromEmail = (email: string): IPerson => ({
  id: email,
  name: email,
  emailAddresses: [email],
  isCurrentUser: 0,
  isInContacts: false,
});

const formatPersonForStore = (person: IPerson) => ({
  ...person,
  id: person.id,
});

export default class PersonModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  async addPeopleToStore(
    people: IPerson[],
    currentUser?: GooglePerson,
    contacts: GooglePerson[] = [],
    emailAddresses: string[] = [],
  ) {
    // TODO: Better handlie missing current user in chrome plugin
    if (!currentUser) {
      return;
    }
    const formattedCurrentUser = formatPerson(currentUser);
    formattedCurrentUser.isCurrentUser = 1;
    const emailAddressToPersonIdHash: any = {};
    const contactLookup: any = {};
    const peopleToAdd: IPerson[] = [formattedCurrentUser];

    contactLookup[formattedCurrentUser.id] = formattedCurrentUser;
    formattedCurrentUser.emailAddresses.forEach((email: string) => {
      contactLookup[email] = formattedCurrentUser;
      emailAddressToPersonIdHash[formatGmailAddress(email)] = formattedCurrentUser.id;
    });

    // Create contact lookup
    contacts.forEach((contact) => {
      let isCurrentUser = false;
      contact.emailAddresses.forEach((emailAddress) => {
        const formattedEmailAddress = formatGmailAddress(emailAddress);
        if (contactLookup[formattedEmailAddress]) {
          isCurrentUser = true;
        } else {
          contactLookup[formattedEmailAddress] = contact;
        }
      });

      if (isCurrentUser) {
        contactLookup[contact.id] = formattedCurrentUser;
      } else {
        contactLookup[contact.id] = contact;
      }
    });

    // Add people first
    people.forEach((person) => {
      let isInStore = false;
      let contact: GooglePerson | null = null;
      person.emailAddresses.forEach((emailAddress) => {
        const formattedEmailAddress = formatGmailAddress(emailAddress);
        if (!contact && contactLookup[formattedEmailAddress]) {
          contact = contactLookup[formattedEmailAddress];
        } else if (emailAddressToPersonIdHash[formattedEmailAddress]) {
          isInStore = true;
        } else {
          person.emailAddresses.forEach((emailAddress) => {
            const formattedEmailAddress = formatGmailAddress(emailAddress);
            emailAddressToPersonIdHash[formattedEmailAddress] = person.id;
          });
        }
      });
      if (contact) {
        peopleToAdd.push(contact);
      } else if (!isInStore) {
        peopleToAdd.push(formatPersonForStore(person));
      }
    });

    // Add email addresses
    emailAddresses.forEach((emailAddress) => {
      const formattedEmailAddress = formatGmailAddress(emailAddress);
      if (!formattedEmailAddress.includes('@calendar.google.com')) {
        const person = emailAddressToPersonIdHash[formattedEmailAddress];
        if (!person) {
          const personToAdd = contactLookup[formattedEmailAddress];
          if (personToAdd) {
            peopleToAdd.push(personToAdd);
          } else {
            peopleToAdd.push(createNewPersonFromEmail(formattedEmailAddress));
          }
        }
      }
    });

    const tx = this.db.transaction('person', 'readwrite');
    console.log(peopleToAdd, 'about to save people');
    await Promise.all(peopleToAdd.map((person) => tx.store.put(person)));
    return tx.done;
  }

  async updatePersonFromGoogleContacts(person: gapi.client.people.Person) {
    const formattedPerson = formatPerson(formatContact(person)!);
    if (formattedPerson) {
      await this.db.put('person', formattedPerson);
    }
    return formattedPerson;
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
      return this.db.get('person', id);
    }
    return undefined;
  }

  async getPersonIdForEmailAddress(emailAddress: string) {
    const person = await this.db.getFromIndex('person', 'by-email', emailAddress);
    return person?.id;
  }

  async getBulkByEmail(emails: string[]): Promise<IPerson[]> {
    const uniqIds = uniq(emails);
    const people = await Promise.all(
      uniqIds.map((email) => this.db.getFromIndex('person', 'by-email', email)),
    );
    return people.filter(Boolean) as any;
  }

  async getBulkByPersonId(personIds: string[]): Promise<IPerson[]> {
    const uniqIds = uniq(personIds);
    const people = await Promise.all(
      uniqIds.map((email) => this.db.getFromIndex('person', 'by-google-id', email)),
    );
    return people.filter(Boolean) as any;
  }

  async getBulk(ids: string[]): Promise<IPerson[]> {
    const uniqIds = uniq(ids);
    const people = await Promise.all(uniqIds.map((id) => this.db.get('person', id)));
    return people.filter(Boolean) as any;
  }
}
