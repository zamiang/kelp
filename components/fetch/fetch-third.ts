import { clone, sortedUniq } from 'lodash';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import { fetchCurrentUserEmailsForEmailAddresses, fetchEmails } from './fetch-emails';
import batchFetchPeople, { person } from './fetch-people';

interface IProps {
  readonly peopleIds: string[];
  readonly emailAddresses: string[];
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
  const peopleResponse = useAsyncAbortable(
    () => batchFetchPeople(props.peopleIds, addPeopleToStore),
    [props.peopleIds.length] as any,
  );

  const emailAddresses = clone(props.emailAddresses);
  personList.forEach((person) => {
    emailAddresses.push(person.emailAddress);
  });

  const uniqueEmailAddresses = sortedUniq(emailAddresses);
  const gmailResponse = useAsyncAbortable(
    () => fetchCurrentUserEmailsForEmailAddresses(uniqueEmailAddresses),
    [uniqueEmailAddresses.length] as any,
  );

  const emails = sortedUniq(gmailResponse.result);
  const emailsResponse = useAsyncAbortable(() => fetchEmails(emails || []), [
    emails ? emails.length : 'error',
  ] as any);
  return {
    isLoading: peopleResponse.loading && emailsResponse.loading,
    emails: emailsResponse.result ? emailsResponse.result : [],
    error: gmailResponse.error || peopleResponse.error || emailsResponse.error,
    personList,
    refetchPersonList: async () => null, // emailsResponse.execute,
  };
};

export default FetchThird;
