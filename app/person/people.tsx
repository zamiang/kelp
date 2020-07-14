import { Drawer } from '@material-ui/core';
import { sortBy } from 'lodash';
import React, { useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import ExpandPerson from './expand-person';
import PersonRow from './person-row';

const People = (props: IRouteProps) => {
  const styles = panelStyles();
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const [selectedPersonId, setSelectedPersonId] = useState(
    props.routeId || (people[0] ? people[0].id : null),
  );
  const selectedPerson = selectedPersonId
    ? props.personDataStore.getPersonById(selectedPersonId)
    : null;
  return (
    <React.Fragment>
      <div className={styles.panel}>
        {people.map((person) => (
          <PersonRow
            key={person.id}
            person={person}
            setSelectedPersonId={setSelectedPersonId}
            selectedPersonId={selectedPersonId}
            {...props}
          />
        ))}
      </div>
      <Drawer
        open={selectedPersonId ? true : false}
        classes={{
          paper: styles.dockedPanel,
        }}
        anchor="right"
        variant="persistent"
      >
        {selectedPersonId && selectedPerson && <ExpandPerson {...props} person={selectedPerson} />}
      </Drawer>
    </React.Fragment>
  );
};

export default People;
