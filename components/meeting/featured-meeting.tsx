import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { formatDistanceToNow, subHours } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import config from '../../constants/config';
import VideoIcon from '../../public/icons/video.svg';
import useButtonStyles from '../shared/button-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import { IFeaturedWebsite } from '../website/get-featured-websites';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(4),
    paddingTop: theme.spacing(3),
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 16,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {},
  },
  containerLine: {
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  leftLine: {
    width: 1,
    background: theme.palette.divider,
    height: '100%',
    marginTop: -1,
    marginLeft: 27,
  },
  containerNow: {
    borderColor: config.LIGHT_BLUE,
  },
  meetingTimeInWords: {
    display: 'inline-block',
    marginBottom: 0,
    color: theme.palette.text.hint,
  },
  heading: {
    color: theme.palette.text.primary,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  button: {
    width: 'auto',
    paddingLeft: 40,
    paddingRight: 40,
  },
  topSpacing: {
    marginTop: theme.spacing(2),
  },
  '@keyframes fadeOut': {
    from: { opacity: 1 },
    '50%': {
      opacity: 0.4,
    },
    to: {
      opacity: 1,
    },
  },
  '@keyframes fadeOut2': {
    from: { opacity: 0.2 },
    '50%': {
      opacity: 0.05,
    },
    to: {
      opacity: 0.2,
    },
  },
  outerDot: {
    width: 40,
    height: 40,
    background: '#FF4500',
    borderRadius: 20,
    animation: '$fadeOut2 5s ease infinite',
  },
  innerDot: {
    width: 13,
    borderRadius: 7,
    height: 13,
    position: 'absolute',
    top: 14,
    left: 14,
    background: '#FF4500',
    animation: '$fadeOut 5s ease infinite',
  },
  dotNow: {
    background: config.LIGHT_BLUE,
  },
  dotContainer: {
    position: 'relative',
  },
}));

export const FeaturedMeeting = (props: {
  meeting: ISegment;
  store: IStore;
  showButton?: boolean;
  hideWebsite: (item: IFeaturedWebsite) => void;
  hideDialogUrl?: string;
  showLine?: boolean;
}) => {
  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const router = useHistory();

  const isFuture = new Date() < props.meeting.start;
  const isInNextHour = new Date() > subHours(props.meeting.start, 1);
  const isHappeningNow = new Date() > props.meeting.start && new Date() < props.meeting.end;

  const domain = props.meeting.videoLink ? new URL(props.meeting.videoLink) : null;
  if (!isInNextHour) {
    return null;
  }
  return (
    <div
      className={clsx(
        !props.showLine && classes.container,
        !isHappeningNow && classes.containerNow,
        props.showLine && classes.containerLine,
      )}
    >
      <Grid container alignItems="flex-end" spacing={2}>
        <Grid item>
          <div className={classes.dotContainer}>
            <div className={clsx(classes.outerDot, !isHappeningNow && classes.dotNow)}></div>
            <div className={clsx(classes.innerDot, !isHappeningNow && classes.dotNow)}></div>
          </div>
        </Grid>
        <Grid item xs>
          {isHappeningNow && (
            <Typography className={classes.meetingTimeInWords}>Happening Now</Typography>
          )}
          {isFuture && (
            <Typography className={classes.meetingTimeInWords}>
              In {formatDistanceToNow(props.meeting.start)}
            </Typography>
          )}
          <Typography
            className={classes.heading}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              void router.push(`/meetings/${props.meeting.id}`);
              return false;
            }}
          >
            {props.meeting.summary || '(no title)'}
          </Typography>
        </Grid>
        {domain && (
          <Grid item>
            <Button
              className={clsx(buttonClasses.button, classes.button)}
              variant="contained"
              color={isHappeningNow ? 'primary' : (config.LIGHT_BLUE as any)}
              startIcon={<VideoIcon width="24" height="24" />}
              onClick={() => window.open(props.meeting.videoLink, '_blank')}
            >
              Join
            </Button>
          </Grid>
        )}
        {props.showLine && (
          <Grid container>
            <Grid item style={{ width: 60 }}>
              <div className={classes.leftLine}></div>
            </Grid>
            <Grid item xs>
              <MeetingRowBelow
                meeting={props.meeting}
                store={props.store}
                shouldPadLeft={false}
                hideWebsite={props.hideWebsite}
                hideDialogUrl={props.hideDialogUrl}
              />
            </Grid>
          </Grid>
        )}
        {!props.showLine && (
          <MeetingRowBelow
            meeting={props.meeting}
            store={props.store}
            shouldPadLeft={false}
            hideWebsite={props.hideWebsite}
            hideDialogUrl={props.hideDialogUrl}
          />
        )}
      </Grid>
    </div>
  );
};
