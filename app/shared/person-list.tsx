import { Avatar, Grid, ListItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import PersonDataStore, { IPerson } from '../store/person-store';

interface IProps {
  handlePersonClick: (id: string) => void;
  people: IPerson[];
  personStore: PersonDataStore;
}

const useStyles = makeStyles(() => ({
  person: {
    transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
    opacity: 1,
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
    },
  },
}));

const PersonRow = (props: IProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {props.people.map((person) => {
        if (!person) {
          return null;
        }
        return (
          <ListItem
            button={true}
            key={person.id}
            onClick={() => props.handlePersonClick(person.emailAddress)}
            className={clsx(classes.person)}
          >
            <Grid container alignItems="center" spacing={1} wrap="nowrap">
              <Grid item>
                <Avatar style={{ height: 24, width: 24 }} src={person.imageUrl || ''}>
                  {(person.name || person.id)[0]}
                </Avatar>
              </Grid>
              <Grid item xs={10}>
                <Typography variant="subtitle2" noWrap>
                  {person.name || person.id}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        );
      })}
    </React.Fragment>
  );
};

const PersonList = (props: IProps) => (
  <Grid container spacing={2}>
    <PersonRow {...props} />
  </Grid>
);

export default PersonList;
