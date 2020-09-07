import { withAuthenticationRequired } from '@auth0/auth0-react';
import { sortBy } from 'lodash';
import { useRouter } from 'next/router';
import React from 'react';
import Container, { IProps } from '../../components/dashboard/container';
import PersonRow from '../../components/person/person-row';
import withStore from '../../components/store/use-store';

const People = (props: IProps) => {
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const selectedPersonId = useRouter().pathname.replace('/dashboard/people/', '');
  return (
    <Container {...props}>
      {people.map((person) => (
        <PersonRow key={person.id} person={person} selectedPersonId={selectedPersonId} {...props} />
      ))}
    </Container>
  );
};

export default withAuthenticationRequired(withStore(People));
