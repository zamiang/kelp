import { formattedEmail } from '../fetch/fetch-second';

interface IEmailById {
  [id: string]: formattedEmail;
}

export default class EmailDataStore {
  private emailById: IEmailById;

  constructor(emails: formattedEmail[]) {
    console.warn('setting up email store');
    this.emailById = {};

    this.addEmailsToStore(emails);
  }

  addEmailsToStore(emails: formattedEmail[]) {
    emails.forEach((email) => {
      this.emailById[email.id] = email;
    });
  }

  getAllEmailsInThread(threadId: string) {
    return Object.values(this.emailById).filter((email) => email.threadId === threadId);
  }

  getById(emailId: string) {
    return this.emailById[emailId];
  }

  getLength() {
    return Object.keys(this.emailById).length;
  }
}
