import { first, uniq } from 'lodash';
import ErrorTracking from '../../error-tracking/error-tracking';
import { formatGmailAddress, formatPerson } from '../../fetch/google/fetch-people';
import { IPerson } from '../data-types';
import { dbType } from '../db';

export const createNewPersonFromEmail = (email: string): IPerson => ({
  id: email,
  name: email,
  emailAddresses: [email],
  googleIds: [],
  isCurrentUser: 0,
  isInContacts: false,
  dateAdded: new Date(),
});

const formatPersonForStore = (person: IPerson): IPerson => ({
  ...person,
  id: person.id,
});

export default class PersonModel {
  private db: dbType;

  constructor(db: dbType) {
    this.db = db;
  }

  /**
   * IMPORTANT NOTE
   * in google, a unique individual can have
   * - multiple email addresses
   * - multiple person ids for each email address
   *
   * @param people
   * @param currentUser
   * @param contacts
   * @param emailAddresses
   * @returns
   */
  async addPeopleToStore(
    people: IPerson[],
    currentUser?: IPerson,
    contacts: IPerson[] = [],
    emailAddresses: string[] = [],
  ) {
    // TODO: Better handlie missing current user in chrome plugin
    if (!currentUser?.id) {
      return;
    }
    const formattedCurrentUser = currentUser;
    (formattedCurrentUser as any).isCurrentUser = 1;
    const emailAddressToPersonIdHash: any = {}; // used for mapping between docs and calendar events
    const contactLookup: any = {};
    const peopleToAdd: IPerson[] = [formattedCurrentUser];

    // designed to work across microsoft and google which have different id schemes
    contactLookup[formattedCurrentUser.id] = formattedCurrentUser;
    if (formattedCurrentUser.emailAddresses[0]) {
      contactLookup[formattedCurrentUser.emailAddresses[0]] = formattedCurrentUser;
    }
    if (formattedCurrentUser.googleIds[0]) {
      contactLookup[formattedCurrentUser.googleIds[0]] = formattedCurrentUser;
    }
    formattedCurrentUser.emailAddresses.forEach((email: string) => {
      contactLookup[email] = formattedCurrentUser;
      emailAddressToPersonIdHash[formatGmailAddress(email)] = formattedCurrentUser.id;
    });

    // Create contact lookup
    contacts.forEach((contact) => {
      if (!contact.id) {
        return;
      }
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

    // Add people first from google drive activity
    people.forEach((person) => {
      let contact: IPerson | null = null;
      person.emailAddresses.forEach((emailAddress) => {
        const formattedEmailAddress = formatGmailAddress(emailAddress);
        const lookedUpContact = contactLookup[formattedEmailAddress];
        if (!contact && lookedUpContact) {
          contact = lookedUpContact;
          emailAddressToPersonIdHash[formattedEmailAddress] = lookedUpContact.id;
        } else {
          emailAddressToPersonIdHash[formattedEmailAddress] = person.id;
        }
      });
      if (contact) {
        peopleToAdd.push(contact);
        if (!(contact as any).isCurrentUser && person.id && person.id !== (contact as any).id) {
          peopleToAdd.push(person);
        }
      } else if (person.id) {
        peopleToAdd.push(formatPersonForStore(person));
      }
    });

    // Add email addresses from calendar events
    emailAddresses.forEach((emailAddress) => {
      const formattedEmailAddress = formatGmailAddress(emailAddress);
      if (formattedEmailAddress.includes('calendar.google.com')) {
        return;
      }
      const personId = emailAddressToPersonIdHash[formattedEmailAddress];
      if (!personId) {
        const personToAdd = contactLookup[formattedEmailAddress];
        if (personToAdd && personToAdd.id) {
          peopleToAdd.push(personToAdd);
        } else {
          peopleToAdd.push(createNewPersonFromEmail(formattedEmailAddress));
        }
      }
    });

    const tx = this.db.transaction('person', 'readwrite');
    const results = await Promise.allSettled(
      peopleToAdd.map(async (person) => await tx.store.put(person)),
    );
    await tx.done;

    results.forEach((result) => {
      if (result.status === 'rejected') {
        ErrorTracking.logErrorInRollbar(result.reason);
      }
    });
    return;
  }

  async updatePersonFromGoogleContacts(person: gapi.client.people.Person) {
    const formattedPerson = formatPerson(person, person.resourceName);
    if (formattedPerson) {
      try {
        await this.db.put('person', formattedPerson);
      } catch (e) {
        ErrorTracking.logErrorInRollbar(e);
      }
    }
    return formattedPerson;
  }

  async getAll(shouldExcludeSelf: boolean) {
    const people = await this.db.getAll('person');
    return people.filter((person) => (shouldExcludeSelf ? !person?.isCurrentUser : true));
  }

  async getSelf(): Promise<IPerson | undefined> {
    const currentUser = await this.db.getAllFromIndex('person', 'is-self', 1 as any);
    return first(currentUser);
  }

  async getByIdOrEmail(idOrEmail: string): Promise<IPerson | undefined> {
    if (idOrEmail) {
      let people = await this.db.getAllFromIndex('person', 'by-google-id', idOrEmail);
      if (!people[0]) {
        people = await this.db.getAllFromIndex('person', 'by-email', idOrEmail);
      }
      return people[0];
    }
    return undefined;
  }

  async getById(id: string): Promise<IPerson | undefined> {
    if (id) {
      const people = await this.db.getAllFromIndex('person', 'by-google-id', id);
      return people[0];
    }
    return undefined;
  }

  async getByEmail(email: string): Promise<IPerson> {
    const people = await this.db.getAllFromIndex('person', 'by-email', email);
    if (people.length > 1) {
      const sortedPeople = people.sort((a, b) => {
        const isBothInContacts = a.isInContacts && b.isInContacts;
        const aDateAdded = a.dateAdded || new Date(new Date().setFullYear(1970));
        const bDateAdded = b.dateAdded || new Date(new Date().setFullYear(1970));
        if (isBothInContacts) {
          return aDateAdded > bDateAdded ? -1 : 1;
        } else {
          return a.isInContacts ? -1 : 1;
        }
      });

      await Promise.all(
        sortedPeople.map(async (p, index) => {
          if (index > 0) {
            return await this.db.delete('person', p.id);
          }
        }),
      );
      return sortedPeople[0];
    }
    return people[0];
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
      uniqIds.map(async (id) => {
        const people = await this.db.getAllFromIndex('person', 'by-google-id', id);
        return people[0];
      }),
    );
    return people.filter(Boolean) as any;
  }

  async getBulk(ids: string[]): Promise<IPerson[]> {
    const uniqIds = uniq(ids);
    const people = await Promise.all(uniqIds.map((id) => this.db.get('person', id)));
    return people.filter(Boolean) as any;
  }
}
