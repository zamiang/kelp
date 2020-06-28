import {
  Avatar,
  Button,
  Collapse,
  Grid,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import clsx from 'clsx';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import AutoLinkText from 'react-autolink-text2';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';
import DriveActivityList from './drive-activity';
import EmailsForSegment from './emails';
import PeopleList from './people-list';

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
  paper: {
    margin: `${theme.spacing(1)}px 0 ${theme.spacing(1)}px auto`,
    padding: theme.spacing(2),
  },
  // todo move into theme
  heading: {
    borderBottom: `2px solid ${theme.palette.secondary.main}`,
    marginBottom: 15,
    display: 'inline-block',
  },
  smallHeading: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
  },
  tableCell: {
    padding: '0 0 0 50px !important',
  },
}));

// For display purposes
type MeetingState = 'current' | 'upcoming' | 'past';

const Meeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  handlePersonClick: (email: string) => void;
  currentTime: Date;
  state: MeetingState;
}) => {
  const [isOpen, setOpen] = useState(props.state === 'current');
  const classes = useRowStyles();
  const actionCount = props.meeting.driveActivityIds.length + props.meeting.emailIds.length;
  const people = (props.meeting.attendees || [])
    .filter((person) => person.email)
    .map((person) => props.personStore.getPersonByEmail(person.email!));
  const hasPeople = people.length > 0;
  const hasEmails = props.meeting.emailIds.length > 0;
  const hasDescription = props.meeting.description && props.meeting.description.length > 0;
  const hasDriveActivity = props.meeting.driveActivityIds.length > 0;
  return (
    <React.Fragment>
      <TableRow
        className={clsx(
          classes.meeting,
          props.state === 'upcoming' && classes.meetingInFuture,
          props.state === 'current' && classes.meetingCurrent,
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
          {actionCount > 0 && <Avatar className={classes.secondary}>{actionCount}</Avatar>}
        </TableCell>
        <TableCell align="right" className={classes.avatarContainer}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!isOpen)}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell className={classes.tableCell} colSpan={6}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Paper className={classes.paper}>
              <Grid container spacing={6}>
                <Grid item xs={9}>
                  {hasDescription && (
                    <Typography variant="body2">
                      <AutoLinkText text={props.meeting.description!} />
                    </Typography>
                  )}
                  {hasEmails && (
                    <React.Fragment>
                      <Typography variant="h6" className={classes.smallHeading}>
                        Emails
                      </Typography>
                      <EmailsForSegment
                        segment={props.meeting}
                        emailStore={props.emailStore}
                        personStore={props.personStore}
                        handlePersonClick={props.handlePersonClick}
                      />
                    </React.Fragment>
                  )}
                  {hasDriveActivity && (
                    <React.Fragment>
                      <Typography variant="h6" className={classes.smallHeading}>
                        Active Documents
                      </Typography>
                      <DriveActivityList
                        driveActivityIds={props.meeting.driveActivityIds}
                        driveActivityStore={props.driveActivityStore}
                        docStore={props.docStore}
                        personStore={props.personStore}
                      />
                    </React.Fragment>
                  )}
                </Grid>
                {hasPeople && (
                  <Grid item xs={3}>
                    <Typography variant="h6" className={classes.heading}>
                      Guests
                    </Typography>
                    <PeopleList people={people} handlePersonClick={props.handlePersonClick} />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const Meetings = (props: IRouteProps) => {
  const [isOpen, setOpen] = useState(false);
  const currentMeetings = props.timeDataStore.getCurrentOrUpNextSegments();
  const upcomingMeetings = props.timeDataStore.getupcomingSegments(
    currentMeetings[0] && currentMeetings[0].id,
  );
  const pastMeetings = props.timeDataStore.getPastSegments(
    currentMeetings[0] && currentMeetings[0].id,
  );

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
      <Grid container alignItems="flex-end">
        <Grid item xs={6}>
          <Typography variant="h2" color="textPrimary" gutterBottom>
            Meetings
          </Typography>
        </Grid>
        <Grid item xs={6} style={{ textAlign: 'right' }}>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            className={styles.topRightButton}
            onClick={() => setOpen(!isOpen)}
          >
            {isOpen ? 'hide' : 'show'} {upcomingMeetings.length} upcoming meetings
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Button>
        </Grid>
      </Grid>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Table size="small">
          <TableBody>
            {upcomingMeetings.map((meeting) => (
              <Meeting
                currentTime={currentTime}
                key={meeting.id}
                meeting={meeting}
                handlePersonClick={props.handlePersonClick}
                personStore={props.personDataStore}
                docStore={props.docDataStore}
                emailStore={props.emailStore}
                driveActivityStore={props.driveActivityStore}
                state="upcoming"
              />
            ))}
          </TableBody>
        </Table>
      </Collapse>
      <Table size="small">
        <TableBody>
          {currentMeetings.map((meeting) => (
            <Meeting
              currentTime={currentTime}
              key={meeting.id}
              meeting={meeting}
              handlePersonClick={props.handlePersonClick}
              personStore={props.personDataStore}
              docStore={props.docDataStore}
              emailStore={props.emailStore}
              driveActivityStore={props.driveActivityStore}
              state="current"
            />
          ))}
        </TableBody>
      </Table>
      <Table size="small">
        <TableBody>
          {pastMeetings.map((meeting) => (
            <Meeting
              currentTime={currentTime}
              key={meeting.id}
              meeting={meeting}
              handlePersonClick={props.handlePersonClick}
              personStore={props.personDataStore}
              docStore={props.docDataStore}
              emailStore={props.emailStore}
              driveActivityStore={props.driveActivityStore}
              state="past"
            />
          ))}
        </TableBody>
      </Table>
    </Grid>
  );
};

export default Meetings;
