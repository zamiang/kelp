import React from 'react';
import { useAsync } from 'react-async-hook';
import Dashboard from './dashboard';
import { IProps as FetchTopProps } from './fetch-top';

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

const fetchEmails = async (emails: email[]) => {
  if (emails.length < 1) {
    return null;
  }
  const emailPromises = emails.map((email) =>
    (gapi.client as any).gmail.users.messages.get({
      id: email.id,
      userId: 'me',
      format: 'metadata',
    }),
  );
  return await Promise.all(emailPromises);
};

export interface IProps extends FetchTopProps {
  personStore: {};
  calendarEvents?: gapi.client.calendar.Event[];
  driveFiles?: gapi.client.drive.File[];
  driveActivity: any;
}

const FetchSecond = (props: IProps) => {
  const addresses = Object.keys(props.personStore);
  const gmailResponse = useAsync(() => listCurrentUserEmailsForContacts(addresses), [
    addresses[0],
    addresses.length,
  ]);
  const emails = gmailResponse.result || [];
  const emailsResponse = useAsync(() => fetchEmails(emails), [emails.length]);

  return <Dashboard emails={emailsResponse.result} {...props} />;
};

export default FetchSecond;
