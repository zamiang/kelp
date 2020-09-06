import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import Container, { IProps } from '../../components/dashboard/container';
import PersonRow from '../../components/person/person-row';

const People = (props: IProps) => {
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = useRouter().pathname.replace('/dashboard/people/', '');
  return (
    <Container>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...props} />
      ))}
    </Container>
  );
};

export default People;
