import { Avatar, Grid, ListItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { orderBy } from 'lodash';
import React from 'react';
import { attendee as attendeeType } from '../fetch/fetch-first';
import PersonDataStore from '../store/person-store';

interface IProps {
  handlePersonClick: (id: string) => void;
  attendees?: attendeeType[] | null;
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
  personAccepted: {},
  personTentative: {
    opacity: 0.8,
  },
  personDeclined: {
    textDecoration: 'line-through',
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  personNeedsAction: {},
}));

const PeopleRow = (props: IProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {orderBy(props.attendees || [], 'responseStatus').map((attendee: attendeeType) => {
        const person = props.personStore.getPersonByEmail(attendee.email!);
        if (!person) {
          return null;
        }
        return (
          <ListItem
            button={true}
            key={person.id}
            onClick={() => props.handlePersonClick(person.emailAddress)}
            className={clsx(
              classes.person,
              attendee.responseStatus === 'accepted' && classes.personAccepted,
              attendee.responseStatus === 'tentative' && classes.personTentative,
              attendee.responseStatus === 'declined' && classes.personDeclined,
              attendee.responseStatus === 'needsAction' && classes.personNeedsAction,
            )}
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

/**
const PeopleGrid = (people: IPerson[], handlePersonClick: (id: string) => void) =>
  chunk(people, ROW_COUNT).map((personRow, index) => (
    <Grid key={index} container item xs={12} spacing={3}>
      {PeopleRow(personRow, handlePersonClick)}
    </Grid>
  ));
 */
const PeopleList = (props: IProps) => (
  <Grid container spacing={2}>
    <PeopleRow {...props} />
  </Grid>
);

export default PeopleList;
