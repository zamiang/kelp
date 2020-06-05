import { uniq } from 'lodash';
import React from 'react';
import { useAsync } from 'react-async-hook';
import FormatData from '../store/create-stores';
import { DriveActivity } from '../types/activity';
import { ICalendarEvent, person } from './fetch-first';

// TODO: Figure out why gapi.client.gmail isn't imported
type email = {
  id: string;
  threadId: string;
};

const listCurrentUserEmailsForContacts = async (emailAddresses: string[]) => {
  if (emailAddresses.length < 1) {
    return null;
  }
  const formattedEmails = emailAddresses.map((email) => `from:${email}`);
  const response = await (gapi.client as any).gmail.users.messages.list({
    userId: 'me',
    q: `newer_than:30d ${formattedEmails.join(' OR ')}`,
  });

  return response.result.messages as email[];
};

type headerName = 'Date' | 'Subject' | 'From' | 'To';

// date: "Sat, 16 May 2020 12:56:45 -0400"
// "Brennan Moore <brennanmoore@gmail.com>"
interface IEmail {
  result: {
    historyId: string;
    id: string;
    internalDate: string;
    labelIds: string[];
    payload: {
      headers: {
        name: headerName;
        value: string;
      }[];
    };
    mimeType: string;
    sizeEstimate: number;
    snippet: string;
    threadId: string;
  };
}

const regex = new RegExp(/<(.*?)>/, 'i');
const formatEmailFromGmail = (email: string) => {
  const formattedValue = regex.exec(email);
  return formattedValue ? formattedValue[1] : null;
};

const fetchEmails = async (emails: email[]): Promise<formattedEmail[]> => {
  if (emails.length < 1) {
    return [];
  }
  const emailPromises = emails.map((email) =>
    (gapi.client as any).gmail.users.messages.get({
      id: email.id,
      userId: 'me',
      format: 'metadata',
      metadataHeaders: ['Date', 'Subject', 'From', 'To'],
    }),
  );
  const emailResponses: IEmail[] = await Promise.all(emailPromises);

  return emailResponses.map((email) => {
    const formattedEmail: formattedEmail = {
      id: email.result.id,
      snippet: email.result.snippet,
      threadId: email.result.threadId,
      date: new Date(),
      subject: '',
      from: null,
      to: [],
    };
    email.result.payload.headers.forEach((header) => {
      switch (header.name) {
        case 'Date':
          formattedEmail.date = new Date(header.value);
          break;
        case 'Subject':
          formattedEmail.subject = header.value;
          break;
        case 'From':
          formattedEmail.from = formatEmailFromGmail(header.value);
          break;
        case 'To':
          formattedEmail.to.push(formatEmailFromGmail(header.value));
      }
    });
    return formattedEmail;
  });
};

export type formattedEmail = {
  id: string;
  snippet: string;
  threadId: string;
  date: Date;
  subject: string;
  from: string | null;
  to: (string | null)[];
};

export interface IProps {
  personList: person[];
  emailList: string[];
  calendarEvents?: ICalendarEvent[];
  driveFiles?: gapi.client.drive.File[];
  driveActivity: DriveActivity[];
}
/**
 * Fetches 2nd layer of information.
 * This layer requires the person store to be completely setup before fetching
 */
const FetchSecond = (props: IProps) => {
  const emailAddresses = props.emailList;
  props.personList.forEach((person) => {
    emailAddresses.push(person.email);
  });
  const uniqueEmailAddresses = uniq(emailAddresses);
  const gmailResponse = useAsync(() => listCurrentUserEmailsForContacts(uniqueEmailAddresses), [
    uniqueEmailAddresses.length,
  ]);
  const emails = gmailResponse.result || [];
  const emailsResponse = useAsync(() => fetchEmails(emails), [emails.length]);
  return <FormatData emails={emailsResponse.result ? emailsResponse.result : []} {...props} />;
};

export default FetchSecond;
