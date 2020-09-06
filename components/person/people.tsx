import { sortBy } from 'lodash';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { IProps } from '../dashboard';
import PersonRow from './person-row';

const People = (props: IProps) => {
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = useLocation().pathname.replace('/dashboard/people/', '');
  return (
    <React.Fragment>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...props} />
      ))}
    </React.Fragment>
  );
};

export default People;
