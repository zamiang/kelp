import { sortBy } from 'lodash';
import React from 'react';
import { IProps } from '../dashboard';
import PersonRow from './person-row';

const People = (props: IProps) => {
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = 'foo';
  return (
    <React.Fragment>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...props} />
      ))}
    </React.Fragment>
  );
};

export default People;
