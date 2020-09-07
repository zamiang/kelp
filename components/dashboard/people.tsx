import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import PersonRow from '../person/person-row';
import { IStore } from '../store/use-store';

const People = (props: IStore) => {
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = useRouter().query.slug as string;
  return (
    <React.Fragment>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...props} />
      ))}
    </React.Fragment>
  );
};

export default People;
