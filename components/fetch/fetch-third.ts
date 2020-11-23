import { clone } from 'lodash';
import { useState } from 'react';
import { useAsyncAbortable } from 'react-async-hook';
import { batchFetchPeople, person } from './fetch-people';
import { fetchSelf } from './fetch-self';

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
    const self = fetchSelf();
    setPersonList(people.concat(self));
  };

  // this has a sideffect of updating the store
  const peopleResponse = useAsyncAbortable(
    () => batchFetchPeople(props.peopleIds, addPeopleToStore),
    [props.peopleIds.length] as any,
  );

  const emailAddresses = clone(props.emailAddresses);
  personList.forEach((person) => {
    person.emailAddresses.map((email) => emailAddresses.push(email));
  });

  const error = peopleResponse ? peopleResponse.error : undefined;

  return {
    isLoading: peopleResponse.loading,
    error,
    personList,
    refetchPersonList: async () => null, // emailsResponse.execute,
  };
};

export default FetchThird;
