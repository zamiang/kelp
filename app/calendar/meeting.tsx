import { Grid, ListItem, Typography } from '@material-ui/core';
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
  meetingAccepted: {
    borderColor: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.main,
    },
  },
  meetingTentative: {
    borderColor: theme.palette.secondary.light,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.light,
    },
  },
  meetingDeclined: {
    textDecoration: 'line-through',
    borderColor: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
      borderColor: theme.palette.secondary.main,
    },
  },
  meetingNeedsAction: {
    borderColor: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.secondary.main,
    },
  },
  meetingSelected: {
    borderColor: theme.palette.info.main,
    background: 'rgba(0, 0, 0, 0.04)', // unsure where this comes from
    '&.MuiListItem-button:hover': {
      borderColor: theme.palette.info.main,
    },
  },
  meetingCurrent: {
    // borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
  meetingInFuture: {
    opacity: 0.7,
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
        props.meeting.selfResponseStatus === 'accepted' && classes.meetingAccepted,
        props.meeting.selfResponseStatus === 'tentative' && classes.meetingTentative,
        props.meeting.selfResponseStatus === 'declined' && classes.meetingDeclined,
        props.meeting.selfResponseStatus === 'needsAction' && classes.meetingNeedsAction,
        props.selectedMeetingId === props.meeting.id && classes.meetingSelected,
      )}
      onClick={() => props.setSelectedMeetingId(props.meeting.id)}
    >
      <Grid container spacing={2}>
        <Grid item style={{ flex: 1 }}>
          <Typography variant="body1">{props.meeting.summary || '(no title)'}</Typography>
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
