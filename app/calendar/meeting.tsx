import { Grid, Link, ListItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

const useStyles = makeStyles((theme) => ({
  meeting: {
    background: 'transparent',
    transition: 'background 0.3s',
    paddingLeft: 0,
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
    '& > *': {
      borderBottom: 'unset',
    },
  },
  meetingSelected: {
    background: theme.palette.background.paper,
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
  tableCell: {
    padding: '0 0 0 50px !important',
  },
  time: { textAlign: 'right' },
}));

const Meeting = (props: {
  meeting: ISegment;
  personStore: PersonDataStore;
  docStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  handlePersonClick: (email: string) => void;
  currentTime: Date;
  setSelectedMeetingId: (id: string) => void;
  selectedMeetingId: string | null;
}) => {
  const classes = useStyles();
  // const actionCount = props.meeting.driveActivityIds.length + props.meeting.emailIds.length;
  return (
    <ListItem
      button={true}
      className={clsx(
        classes.meeting,
        props.meeting.state === 'upcoming' && classes.meetingInFuture,
        props.meeting.state === 'current' && classes.meetingCurrent,
        props.selectedMeetingId === props.meeting.id && classes.meetingSelected,
      )}
      onClick={() => props.setSelectedMeetingId(props.meeting.id)}
    >
      <Grid container spacing={2}>
        <Grid item style={{ flex: 1 }}>
          <Typography variant="body1" style={{ fontWeight: 'bold' }}>
            <Link color="textPrimary" target="_blank" href={props.meeting.link || ''}>
              {props.meeting.summary || '(no title)'}
            </Link>
          </Typography>
        </Grid>
        <Grid item className={classes.time}>
          <Typography variant="subtitle2" color="textPrimary">
            {format(props.meeting.start, 'p')}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {format(props.meeting.end, 'p')}
          </Typography>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default Meeting;
