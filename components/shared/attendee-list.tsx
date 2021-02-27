import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { orderBy } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import config from '../../constants/config';
import useExpandStyles from '../shared/expand-styles';
import { IFormattedAttendee } from '../store/models/attendee-model';
import PersonDataStore, { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';

interface IProps {
  attendees: IFormattedAttendee[];
  personStore: PersonDataStore;
  showAll: boolean;
  attendeeMeetingCount?: any;
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
  copyButton: {
    textAlign: 'right',
    textDecoration: 'underline',
    transition: 'opacity 0.3s',
    '&:active': {
      opacity: 0.7,
    },
  },
  hideOnMobile: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
}));

const Row = (props: {
  attendee: IFormattedAttendee;
  personStore: IStore['personDataStore'];
  meetingCount?: number;
}) => {
  const classes = useStyles();
  const expandClasses = useExpandStyles();
  const router = useHistory();
  const [person, setPerson] = useState<IPerson | undefined>(undefined);
  useEffect(() => {
    const fetchData = async () => {
      if (props.attendee.personId) {
        const result = await props.personStore.getPersonById(props.attendee.personId);
        setPerson(result);
      }
    };
    void fetchData();
  }, [props.attendee.personId]);

  if (!person) {
    return null;
  }
  return (
    <Button
      key={person.id}
      onClick={(event) => {
        event.stopPropagation();
        router.push(`/people/${encodeURIComponent(person.id)}`);
        return false;
      }}
      className={clsx(
        expandClasses.listItem,
        classes.person,
        props.attendee.responseStatus === 'accepted' && classes.personAccepted,
        props.attendee.responseStatus === 'tentative' && classes.personTentative,
        props.attendee.responseStatus === 'declined' && classes.personDeclined,
        props.attendee.responseStatus === 'needsAction' && classes.personNeedsAction,
      )}
    >
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
        <Grid item>
          <Typography variant="body2" noWrap>
            {person.name || person.id}
          </Typography>
        </Grid>
        {props.meetingCount && (
          <Grid item className={classes.hideOnMobile}>
            <Typography variant="caption" noWrap>
              {props.meetingCount} meetings
            </Typography>
          </Grid>
        )}
        <Grid
          item
          className={classes.copyButton}
          onClick={(event) => {
            event.stopPropagation();
            void navigator.clipboard.writeText(person.emailAddresses[0]);
            return false;
          }}
        >
          <Typography variant="caption" noWrap>
            Copy Email
          </Typography>
        </Grid>
      </Grid>
    </Button>
  );
};

const AttendeeRows = (props: IProps) => {
  const expandClasses = useExpandStyles();
  const orderedAttendees = orderBy(props.attendees || [], 'responseStatus');
  return (
    <div className={expandClasses.list}>
      {orderedAttendees.map((attendee) => (
        <Row
          key={attendee.id}
          attendee={attendee}
          personStore={props.personStore}
          meetingCount={
            props.attendeeMeetingCount &&
            attendee.personId &&
            props.attendeeMeetingCount[attendee.personId]
          }
        />
      ))}
    </div>
  );
};

const useAttendeeStyles = makeStyles(() => ({
  expand: {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const AttendeeList = (props: IProps) => {
  const classes = useAttendeeStyles();
  const [isExpanded, setExpand] = useState<boolean>(
    props.showAll || props.attendees.length < config.ATTENDEE_MAX,
  );
  if (props.attendees.length < 1) {
    return <Typography variant="body2">None</Typography>;
  }
  return (
    <React.Fragment>
      {isExpanded && <AttendeeRows {...props} />}
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
