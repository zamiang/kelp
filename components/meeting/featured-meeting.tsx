import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { formatDistanceToNow, subHours } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import useButtonStyles from '../shared/button-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(1),
    cursor: 'pointer',
    borderBottom: `2px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      paddingTop: 0,
      borderBottom: '0px solid',
    },
  },
  meetingTimeInWords: {
    display: 'inline-block',
    marginBottom: 0,
  },
  heading: {},
  button: {
    width: 'auto',
    paddingLeft: 40,
    paddingRight: 40,
  },
  topSpacing: {
    marginTop: theme.spacing(2),
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
      <Grid container alignItems="flex-end">
        <Grid item xs={12} sm={9}>
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
          <Typography className={classes.heading} style={{ cursor: 'pointer' }} variant="h2">
            {props.meeting.summary || '(no title)'}
          </Typography>
        </Grid>
        {domain && isInNextHour && (
          <Grid item>
            <Button
              className={clsx(buttonClasses.button, classes.button)}
              variant="contained"
              color="primary"
              onClick={() => window.open(props.meeting.videoLink, '_blank')}
            >
              Join {domain?.host}
            </Button>
          </Grid>
        )}
        {isInNextHour && (
          <Grid item xs={12}>
            <div className={classes.topSpacing}>
              <MeetingRowBelow meeting={props.meeting} store={props.store} shouldPadLeft={false} />
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
