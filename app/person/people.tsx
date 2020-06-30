import { Avatar, Drawer, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { sortBy } from 'lodash';
import React, { useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import { IPerson } from '../store/person-store';
import Person from './person';

const useStyles = makeStyles((theme) => ({
  person: {
    background: 'transparent',
    borderLeft: `2px solid ${theme.palette.secondary.main}`,
    transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
    opacity: 1,
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: 0,
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
      borderColor: theme.palette.secondary.main,
    },
  },
  personSelected: {
    borderColor: theme.palette.info.main,
    background: 'rgba(0, 0, 0, 0.04)', // unsure where this comes from
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.info.main,
    },
  },
}));

const PersonRow = (
  props: {
    setSelectedPersonId: (id: string) => void;
    selectedPersonId: string | null;
    person: IPerson;
  } & IRouteProps,
) => {
  const classes = useStyles();
  // const actionCount = props.meeting.driveActivityIds.length + props.meeting.emailIds.length;
  return (
    <ListItem
      button={true}
      className={clsx(
        classes.person,
        props.selectedPersonId === props.person.id && classes.personSelected,
      )}
      onClick={() => props.setSelectedPersonId(props.person.id)}
    >
      <ListItemIcon>
        {props.person.imageUrl ? (
          <Avatar src={props.person.imageUrl} />
        ) : (
          <Avatar>{(props.person.name || props.person.id)[0]}</Avatar>
        )}
      </ListItemIcon>
      <ListItemText primary={props.person.name || props.person.id} />
    </ListItem>
  );
};

const People = (props: IRouteProps) => {
  const styles = panelStyles();
  const people = sortBy(props.personDataStore.getPeople(), 'name');
  const [selectedPersonId, setSelectedPersonId] = useState(
    props.routeId || (people[0] ? people[0].id : null),
  );
  const selectedPerson = selectedPersonId
    ? props.personDataStore.getPersonByEmail(selectedPersonId)
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
        {selectedPersonId && selectedPerson && <Person {...props} person={selectedPerson} />}
      </Drawer>
    </React.Fragment>
  );
};

export default People;
