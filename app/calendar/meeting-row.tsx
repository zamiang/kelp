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

export const CURRENT_TIME_ELEMENT_ID = 'meeting-at-current-time';

const useStyles = makeStyles((theme) => ({
  meeting: {
    background: 'transparent',
    transition: 'background 0.3s, opacity 0.3s',
    opacity: 1,
    paddingLeft: 0,
    marginBottom: theme.spacing(1),
    '& > *': {
      borderBottom: 'unset',
    },
    '&.MuiListItem-button:hover': {
      opacity: 0.8,
      borderColor: theme.palette.secondary.main,
    },
  },
  meetingAccepted: {},
  meetingTentative: {
    color: theme.palette.text.hint,
  },
  meetingDeclined: {
    textDecoration: 'line-through',

    '&.MuiListItem-button:hover': {
      textDecoration: 'line-through',
    },
  },
  meetingNeedsAction: {
    color: theme.palette.text.hint,
  },
  meetingSelected: {
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
  currentTime: {
    marginLeft: -theme.spacing(3),
    marginTop: -theme.spacing(1),
  },
  currentTimeDot: {
    borderRadius: '50%',
    height: 8,
    width: 8,
    background: theme.palette.secondary.main,
  },
  currentTimeBorder: {
    marginTop: 0,
    width: '100%',
    borderTop: `2px solid ${theme.palette.secondary.main}`,
  },
  border: {
    borderRadius: 4,
    background: theme.palette.secondary.main,
    padding: '0px !important',
    transition: 'background 0.3s',
    width: 4,
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(2),
  },
  borderAccepted: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  borderTentative: {
    background: theme.palette.secondary.light,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.light,
    },
  },
  borderDeclined: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  borderNeedsAction: {
    background: theme.palette.secondary.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.secondary.main,
    },
  },
  borderSelected: {
    background: theme.palette.info.main,
    '&.MuiListItem-button:hover': {
      background: theme.palette.info.main,
    },
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
  setSelectedMeetingId: (id: string) => void;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
}) => {
  const classes = useStyles();
  // const actionCount = props.meeting.driveActivityIds.length + props.meeting.emailIds.length;

  // Set the meeting ID to the current one if none is set. Potentially is a way to do this w/o hooks?
  if (props.shouldRenderCurrentTime && !props.selectedMeetingId) {
    props.setSelectedMeetingId(props.meeting.id);
  }
  return (
    <React.Fragment>
      {props.shouldRenderCurrentTime && (
        <ListItem className={classes.currentTime} id={CURRENT_TIME_ELEMENT_ID}>
          <div className={classes.currentTimeDot}></div>
          <div className={classes.currentTimeBorder}></div>
        </ListItem>
      )}
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
        <Grid container spacing={1}>
          <Grid
            item
            className={clsx(
              classes.border,
              props.meeting.selfResponseStatus === 'accepted' && classes.borderAccepted,
              props.meeting.selfResponseStatus === 'tentative' && classes.borderTentative,
              props.meeting.selfResponseStatus === 'declined' && classes.borderDeclined,
              props.meeting.selfResponseStatus === 'needsAction' && classes.borderNeedsAction,
              props.selectedMeetingId === props.meeting.id && classes.borderSelected,
            )}
          ></Grid>
          <Grid item style={{ flex: 1 }}>
            <Typography variant="body1">{props.meeting.summary || '(no title)'}</Typography>
          </Grid>
          <Grid item className={classes.time}>
            <Typography variant="subtitle2">{format(props.meeting.start, 'p')}</Typography>
            <Typography variant="subtitle2" style={{ opacity: 0.5 }}>
              {format(props.meeting.end, 'p')}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </React.Fragment>
  );
};

export default Meeting;
