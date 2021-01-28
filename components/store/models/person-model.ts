import { first } from 'lodash';
import { person as GooglePerson } from '../../fetch/fetch-people';
import { dbType } from '../db';

export interface IPerson {
  id: string;
  name: string;
  emailAddresses: string[];
  imageUrl?: string | null;
  notes?: string;
  googleId: string | null;
  isCurrentUser: boolean;
  isInContacts: boolean;
}

export const formatPerson = (person: GooglePerson) => ({
  id: person.id.replace('people/', ''),
  name: person.name,
  googleId: person.id,
  emailAddresses: person.emailAddresses,
  imageUrl: person.imageUrl,
  isCurrentUser: false,
  isInContacts: person.isInContacts,
  notes: person.notes,
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

  async addPeopleToStore(people: IPerson[]) {
    const tx = this.db.transaction('person', 'readwrite');
    await Promise.all(people.map((person) => tx.store.put(formatPersonForStore(person))));
    return tx.done;
  }

  async addContactsToStore(contacts: GooglePerson[]) {
    const tx = this.db.transaction('person', 'readwrite');
    await Promise.all(contacts.map((contact) => tx.store.put(formatPerson(contact))));
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
