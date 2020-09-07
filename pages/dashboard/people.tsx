import { withAuthenticationRequired } from '@auth0/auth0-react';
import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import Container from '../../components/dashboard/container';
import PersonRow from '../../components/person/person-row';
import useStore from '../../components/store/use-store';

const People = () => {
  const store = useStore();
  const people = sortBy(store.personDataStore.getPeople(), 'name');
  const selectedPersonId = useRouter().pathname.replace('/dashboard/people/', '');
  return (
    <Container {...store}>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...store} />
      ))}
    </Container>
  );
};

export default withAuthenticationRequired(People);
