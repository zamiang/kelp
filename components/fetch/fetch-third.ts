import { clone, sortedUniq } from 'lodash';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import config from '../../constants/config';
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
    if (person.emailAddress) {
      emailAddresses.push(person.emailAddress);
    }
  });

  const uniqueEmailAddresses = sortedUniq(emailAddresses);
  // eslint-ignore-next-line
  const gmailResponse =
    config.IS_GMAIL_ENABLED &&
    // eslint-disable-next-line
    useAsyncAbortable(() => fetchCurrentUserEmailsForEmailAddresses(uniqueEmailAddresses), [
      uniqueEmailAddresses.length,
    ] as any);

  const emails = gmailResponse ? sortedUniq(gmailResponse.result) : [];
  const emailsResponse =
    config.IS_GMAIL_ENABLED &&
    // eslint-disable-next-line
    useAsyncAbortable(() => fetchEmails(emails || []), [emails ? emails.length : 'error'] as any);

  const error =
    gmailResponse && emailsResponse && peopleResponse
      ? gmailResponse.error || peopleResponse.error || emailsResponse.error
      : undefined;

  return {
    isLoading: peopleResponse.loading && emailsResponse && emailsResponse.loading,
    emails: emailsResponse && emailsResponse.result ? emailsResponse.result : [],
    error,
    personList,
    refetchPersonList: async () => null, // emailsResponse.execute,
  };
};

export default FetchThird;
