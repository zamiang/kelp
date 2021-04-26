import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDistanceToNow, subHours } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useButtonStyles from '../shared/button-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
  container: {
    textAlign: 'center',
    borderRadius: 5,
    paddingTop: theme.spacing(2),
  },
  meetingTimeInWords: {
    color: theme.palette.text.hint,
    display: 'inline-block',
    marginBottom: 0,
  },
}));

export const FeaturedMeeting = (props: {
  meeting: ISegment;
  store: IStore;
  showButton?: boolean;
}) => {
  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const router = useHistory();

  const isFuture = new Date() < props.meeting.start;
  const isInNextHour = new Date() > subHours(props.meeting.start, 1);
  const isHappeningNow = new Date() > props.meeting.start && new Date() < props.meeting.end;

  const domain = props.meeting.videoLink ? new URL(props.meeting.videoLink) : null;
  return (
    <div
      className={classes.container}
      onClick={() => {
        void router.push(`/meetings/${props.meeting.id}`);
        return false;
      }}
    >
      <Grid container alignItems="center">
        <Grid item xs={12}>
          {isHappeningNow && (
            <Typography variant="h6" className={classes.meetingTimeInWords}>
              Happening Now
            </Typography>
          )}
          {isFuture && (
            <Typography variant="h6" className={classes.meetingTimeInWords}>
              In {formatDistanceToNow(props.meeting.start)}
            </Typography>
          )}
          <Typography variant="h3" style={{ cursor: 'pointer' }}>
            {props.meeting.summary || '(no title)'}
          </Typography>
        </Grid>
        {domain && isInNextHour && (
          <Grid item xs={12}>
            <Button
              className={buttonClasses.button}
              variant="contained"
              disableElevation
              color="primary"
              onClick={() => window.open(props.meeting.videoLink, '_blank')}
              style={{
                marginRight: 'auto',
                marginLeft: 'auto',
                width: 'auto',
                paddingLeft: 40,
                paddingRight: 40,
                marginTop: 8,
              }}
            >
              Join {domain?.host}
            </Button>
          </Grid>
        )}
        {isInNextHour && (
          <Grid item xs={12}>
            <MeetingRowBelow meeting={props.meeting} store={props.store} shouldPadLeft={false} />
          </Grid>
        )}
      </Grid>
    </div>
  );
};
