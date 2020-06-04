import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useAsync } from 'react-async-hook';
import { styles } from './app';
import Copyright from './copyright';
import Docs from './docs';
import LeftDrawer from './left-drawer';
import TopBar from './top-bar';

// TODO: Figure out why gapi.client.gmail isn't imported
type email = {
  id: string;
  threadId: string;
};

const listCurrentUserEmailsForContacts = async (emailAddresses: string[]) => {
  console.log('about to fetch', emailAddresses);
  if (emailAddresses.length < 1) {
    return null;
  }
  console.log('about to fetch', emailAddresses);
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

interface IProps {
  classes: styles;
  accessToken: string;
}

const FetchSecond = (props: IProps) => {
  const addresses = Object.keys(props.personStore);
  const gmailResponse = useAsync(() => listCurrentUserEmailsForContacts(addresses), [
    addresses[0],
    addresses.length,
  ]);
  console.log(gmailResponse, '<<<<<<<<<<<');
  const emails = gmailResponse.result || [];
  const emailsResponse = useAsync(() => fetchEmails(emails), [emails.length]);

  return <Dashboard emails={emailsResponse.result} />;
};

export default FetchSecond;
