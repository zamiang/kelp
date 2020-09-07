import { uniq } from 'lodash';
import { useState } from 'react';
import { useAsync } from 'react-async-hook';
import { fetchCurrentUserEmailsForEmailAddresses, fetchEmails } from './fetch-emails';
import batchFetchPeople, { person } from './fetch-people';

interface IProps {
  peopleIds: string[];
  emailAddresses: string[];
}

/**
 * Fetches people
 * This layer requires the person store to be completely setup before fetching
 */
const FetchThird = (props: IProps) => {
  const initialPersonList: person[] = [];
  const [personList, setPersonList] = useState(initialPersonList);
  const addPeopleToStore = (people: person[]) => {
    // TODO: Add and diff here
    setPersonList(people);
  };
  // this has a sideffect of updating the store
  const peopleResponse = useAsync(() => batchFetchPeople(props.peopleIds, addPeopleToStore), [
    props.peopleIds.length,
  ]);

  const emailAddresses = props.emailAddresses;
  personList.forEach((person) => {
    emailAddresses.push(person.emailAddress);
  });

  const uniqueEmailAddresses = uniq(emailAddresses);

  const gmailResponse = useAsync(
    () => fetchCurrentUserEmailsForEmailAddresses(uniqueEmailAddresses),
    [uniqueEmailAddresses.length],
  );

  const emails = gmailResponse.result || [];
  const emailsResponse = useAsync(() => fetchEmails(emails), [emails.length]);

  return {
    isLoading: peopleResponse.loading && emailsResponse.loading,
    emails: emailsResponse.result ? emailsResponse.result : [],
    personList,
    refetchPersonList: async () => null, // emailsResponse.execute,
  };
};

export default FetchThird;
