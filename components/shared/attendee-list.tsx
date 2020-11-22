import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { orderBy } from 'lodash';
import Link from 'next/link';
import React, { useState } from 'react';
import PersonDataStore from '../store/person-store';
import { IFormattedAttendee } from '../store/time-store';

interface IProps {
  attendees: IFormattedAttendee[];
  personStore: PersonDataStore;
}

const useStyles = makeStyles((theme) => ({
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
  personNeedsAction: {
    opacity: 0.8,
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
  },
}));

const AttendeeRow = (props: IProps) => {
  const classes = useStyles();
  return (
    <React.Fragment>
      {orderBy(props.attendees || [], 'responseStatus').map((attendee) => {
        const person = props.personStore.getPersonById(attendee.personId);
        if (!person) {
          return null;
        }
        return (
          <ListItem
            button={true}
            key={person.id}
            disableGutters
            className={clsx(
              classes.person,
              attendee.responseStatus === 'accepted' && classes.personAccepted,
              attendee.responseStatus === 'tentative' && classes.personTentative,
              attendee.responseStatus === 'declined' && classes.personDeclined,
              attendee.responseStatus === 'needsAction' && classes.personNeedsAction,
            )}
          >
            <Link href={`?tab=people&slug=${person.id}`}>
              <Grid container alignItems="center" spacing={1} wrap="nowrap">
                <Grid item>
                  <Avatar
                    style={{ height: 24, width: 24 }}
                    src={person.imageUrl || ''}
                    className={classes.avatar}
                  >
                    {(person.name || person.id)[0]}
                  </Avatar>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="subtitle2" noWrap>
                    {person.name || person.id}
                  </Typography>
                </Grid>
              </Grid>
            </Link>
          </ListItem>
        );
      })}
    </React.Fragment>
  );
};

const attendeeMax = 10;

const useAttendeeStyles = makeStyles((theme) => ({
  expand: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const AttendeeList = (props: IProps) => {
  const classes = useAttendeeStyles();
  const [isExpanded, setExpand] = useState<boolean>(props.attendees.length < attendeeMax);
  return (
    <React.Fragment>
      {isExpanded && <AttendeeRow {...props} />}
      {!isExpanded && (
        <Typography
          variant="subtitle2"
          className={clsx(classes.expand, 'ignore-react-onclickoutside')}
          onClick={() => setExpand(true)}
        >
          Show Full List
        </Typography>
      )}
    </React.Fragment>
  );
};

export default AttendeeList;
