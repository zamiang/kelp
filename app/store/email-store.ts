import { formattedEmail } from '../fetch/fetch-emails';
import PersonDataStore from './person-store';

export interface IEmail extends formattedEmail {
  fromPersonId: string;
}

interface IEmailById {
  [id: string]: IEmail;
}

export default class EmailDataStore {
  private emailById: IEmailById;

  constructor(emails: formattedEmail[], personStore: PersonDataStore) {
    console.warn('setting up email store');
    this.emailById = {};
    this.addEmailsToStore(emails, personStore);
  }

  addEmailsToStore(emails: formattedEmail[], personStore: PersonDataStore) {
    emails.forEach((email) => {
      if (email.from) {
        this.emailById[email.id] = {
          ...email,
          fromPersonId: personStore.getPersonIdForEmailAddress(email.from),
        };
      }
    });
  }

  getAllEmailsInThread(threadId: string) {
    return Object.values(this.emailById).filter((email) => email.threadId === threadId);
  }

  getEmailsFrom(emailAddresses: string[]) {
    return Object.values(this.emailById).filter(
      (email) => email.from && emailAddresses.indexOf(email.from) > -1,
    );
  }

  getById(emailId: string): IEmail | undefined {
    return this.emailById[emailId];
  }

  getLength() {
    return Object.keys(this.emailById).length;
  }
}
