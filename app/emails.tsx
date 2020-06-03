import React from 'react';
import { useAsync } from 'react-async-hook';

type person = {
  id: string;
  name: string;
  email: string;
};

interface IProps {
  people: person[];
}

// TODO: Figure out why gapi.client.gmail isn't imported
const listEmails = async (people: person[]) => {
  const formattedEmails = people.map((person) => `from:${person.email}`);
  return await (gapi.client as any).gmail.users.messages.list({
    userId: 'me',
    q: `newer_than:30d ${formattedEmails.join(' OR ')}`,
  });
};

const Emails = (props: IProps) => {
  const gmailResponse = useAsync(() => listEmails(props.people), [props.people]);
  return <div>{JSON.stringify(gmailResponse)}</div>;
};

export default Emails;
