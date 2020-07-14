import { Grid, ListItem, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import useRowStyles from '../shared/row-styles';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import { ISegment } from '../store/time-store';

export const CURRENT_TIME_ELEMENT_ID = 'meeting-at-current-time';

const useStyles = makeStyles((theme) => ({
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
}));

const MeetingRow = (props: {
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
  const rowStyles = useRowStyles();
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
          rowStyles.row,
          props.meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
          props.meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
          props.meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
          props.meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
          props.selectedMeetingId === props.meeting.id && rowStyles.rowPrimaryMain,
        )}
        onClick={() => props.setSelectedMeetingId(props.meeting.id)}
      >
        <Grid container spacing={1}>
          <Grid
            item
            className={clsx(
              rowStyles.border,
              props.meeting.selfResponseStatus === 'accepted' && rowStyles.borderSecondaryMain,
              props.meeting.selfResponseStatus === 'tentative' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'declined' && rowStyles.borderSecondaryLight,
              props.meeting.selfResponseStatus === 'needsAction' && rowStyles.borderSecondaryLight,
              props.selectedMeetingId === props.meeting.id && rowStyles.borderInfoMain,
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

export default MeetingRow;
