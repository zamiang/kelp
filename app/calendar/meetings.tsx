import Avatar from '@material-ui/core/Avatar';
import Collapse from '@material-ui/core/Collapse';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import clsx from 'clsx';
import { format, isAfter, isBefore } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { IRouteProps } from '../dashboard';
import DriveActivityList from '../docs/drive-activity-list';
import PeopleList from '../nav/people-list';
import panelStyles from '../shared/panel-styles';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';
import EmailsForSegment from './emails';

const useRowStyles = makeStyles((theme) => ({
  meeting: {
    background: 'transparent',
    transition: 'background 0.3s',
    '& > *': {
      borderBottom: 'unset',
    },
  },
  meetingCurrent: {
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
  meetingInFuture: {
    opacity: 0.7,
  },
  secondary: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    backgroundColor: theme.palette.secondary.main,
  },
  avatarContainer: {
    width: 42,
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const Meeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  handlePersonClick: (email: string) => void;
  currentTime: Date;
}) => {
  const isMeetingInFuture = isBefore(props.currentTime, props.meeting.start);
  const isCurrent = !isAfter(props.currentTime, props.meeting.end) && !isMeetingInFuture;
  const [isOpen, setOpen] = useState(isCurrent);
  const classes = useRowStyles();
  const actionCount = props.meeting.driveActivityIds.length + props.meeting.emailIds.length;
  const people = (props.meeting.attendees || [])
    .filter((person) => person.email)
    .map((person) => props.personStore.getPersonByEmail(person.email!));
  const hasPeople = people.length > 0;
  const hasEmails = props.meeting.emailIds.length > 0;
  const hasDriveActivity = props.meeting.driveActivityIds.length > 0;
  return (
    <React.Fragment>
      <TableRow
        className={clsx(
          classes.meeting,
          isMeetingInFuture && classes.meetingInFuture,
          isCurrent && classes.meetingCurrent,
        )}
        hover
        onClick={() => setOpen(!isOpen)}
      >
        <TableCell style={{ width: '1%', paddingRight: '1px' }} align="right">
          <Typography variant="h6">{format(props.meeting.start, 'd')}</Typography>
        </TableCell>
        <TableCell style={{ width: '1%', textTransform: 'uppercase', paddingTop: '7px' }}>
          <Typography variant="caption">{format(props.meeting.start, 'MMM')}</Typography>
        </TableCell>
        <TableCell style={{ width: '168px' }}>
          {format(props.meeting.start, 'p')}–{format(props.meeting.end, 'p')}
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="h6">
            <Link color="textPrimary" target="_blank" href={props.meeting.link || ''}>
              {props.meeting.summary}
            </Link>
          </Typography>
        </TableCell>
        <TableCell align="right" className={classes.avatarContainer}>
          <Avatar className={classes.secondary}>{actionCount}</Avatar>
        </TableCell>
        <TableCell align="right" className={classes.avatarContainer}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Grid container spacing={1}>
              {hasEmails && (
                <Grid item style={{ width: '100%' }}>
                  <Typography variant="h6">Emails</Typography>
                  <EmailsForSegment
                    segment={props.meeting}
                    emailStore={props.emailStore}
                    personStore={props.personStore}
                    handlePersonClick={props.handlePersonClick}
                  />
                </Grid>
              )}
              {hasDriveActivity && (
                <Grid item>
                  <Typography variant="h6">Active Documents</Typography>
                  <DriveActivityList
                    driveActivityIds={props.meeting.driveActivityIds}
                    driveActivityStore={props.driveActivityStore}
                    docStore={props.docStore}
                    personStore={props.personStore}
                  />
                </Grid>
              )}
              {hasPeople && (
                <Grid item>
                  <Typography variant="h6">Guests</Typography>
                  <PeopleList people={people} handlePersonClick={props.handlePersonClick} />
                </Grid>
              )}
            </Grid>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Meetings = (props: IRouteProps) => {
  const meetings = props.timeDataStore.getSegments();
  const [seconds, setSeconds] = useState(0);
  const styles = panelStyles();

  // rerender every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);

  const currentTime = new Date();
  return (
    <Grid item xs={12} className={styles.panel}>
      <Typography variant="h2" color="textPrimary" gutterBottom>
        Meetings
      </Typography>
      <Table size="small">
        <TableBody>
          {meetings.map((meeting) => (
            <Meeting
              currentTime={currentTime}
              key={meeting.id}
              meeting={meeting}
              handlePersonClick={props.handlePersonClick}
              personStore={props.personDataStore}
              docStore={props.docDataStore}
              emailStore={props.emailStore}
              driveActivityStore={props.driveActivityStore}
            />
          ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

export default Meetings;
