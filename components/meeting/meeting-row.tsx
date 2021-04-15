import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { mediumFontFamily } from '../../constants/theme';
import VideoIcon from '../../public/icons/video-white.svg';
import useButtonStyles from '../shared/button-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
  time: { minWidth: 150, maxWidth: 180 },
  row: {
    paddingLeft: 0,
    width: 'auto',
    [theme.breakpoints.down('sm')]: {
      marginLeft: -4,
      paddingLeft: theme.spacing(2),
      borderRadius: 0,
    },
  },
  summary: {
    flex: 1,
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
    },
  },
  noLeftMargin: {
    marginLeft: 0,
  },
  smallContainer: {
    flexDirection: 'column-reverse',
    overflow: 'hidden',
  },
  container: {
    cursor: 'pointer',
    '&:hover': {
      background: 'transparent',
    },
  },
  rotateIcon: {
    transform: 'rotate(90deg)',
  },
  icon: {
    transition: 'transform 0.3s',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing(0.5),
  },
  dotPast: {
    backgroundColor: theme.palette.grey[200],
  },
  dotFuture: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  dotPresent: {
    backgroundColor: theme.palette.primary.main,
  },
  text: {},
  textPast: { color: 'rgba(0,0,0,0.3)' },
  textFuture: {},
  textPresent: { color: theme.palette.primary.main },
  iconContainer: {
    marginLeft: -20,
    marginRight: -2,
  },
  meetingTimeInWords: {
    color: 'rgba(0,0,0,0.4)',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    display: 'inline-block',
    marginLeft: theme.spacing(1),
  },
  meetingTimeInWordsDark: {
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    display: 'inline-block',
    marginRight: theme.spacing(1),
  },
}));

const MeetingRow = (props: {
  meeting: ISegment;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
  store: IStore;
  isSmall?: boolean;
  isOpen?: boolean;
  isOneLine?: boolean;
  hideDot?: boolean;
}) => {
  const classes = useStyles();
  const buttonClasses = useButtonStyles();
  const router = useHistory();
  const isSelected = props.selectedMeetingId === props.meeting.id || props.isOpen;
  const [isDetailsVisible] = useState(!props.isOneLine);

  const isPast = new Date() > props.meeting.end;
  const isFuture = new Date() < props.meeting.start;
  const isHappeningNow = new Date() > props.meeting.start && new Date() < props.meeting.end;
  return (
    <div
      onClick={() => {
        void router.push(`/meetings/${props.meeting.id}`);
        return false;
      }}
      className={classes.container}
    >
      <Grid container spacing={1} alignItems="center">
        {!props.hideDot && (
          <Grid item>
            <div
              className={clsx(
                classes.dot,
                props.shouldRenderCurrentTime && classes.dotPresent,
                !props.shouldRenderCurrentTime && isFuture && classes.dotFuture,
                !props.shouldRenderCurrentTime && isPast && classes.dotPast,
              )}
            />
          </Grid>
        )}
        <Grid item xs zeroMinWidth className={clsx(props.isSmall && classes.smallContainer)}>
          <Grid container spacing={2} alignItems="center">
            {isHappeningNow && !props.isOneLine && (
              <Grid item style={{ paddingBottom: 0, paddingTop: 0 }}>
                <IconButton
                  size={props.isOneLine ? 'small' : 'medium'}
                  onClick={() => window.open(props.meeting.videoLink, '_blank')}
                  className={buttonClasses.circleButton}
                >
                  <VideoIcon width="18" height="18" />
                </IconButton>
              </Grid>
            )}
            <Grid item>
              {!props.isOneLine && (
                <React.Fragment>
                  <Typography
                    className={clsx(classes.textPast)}
                    style={{ display: 'inline-block' }}
                  >
                    {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
                  </Typography>
                  {props.shouldRenderCurrentTime && isHappeningNow && (
                    <Typography className={classes.meetingTimeInWords}>Happening Now</Typography>
                  )}
                  {props.shouldRenderCurrentTime && isFuture && (
                    <Typography className={classes.meetingTimeInWords}>
                      (In {formatDistanceToNow(props.meeting.start)})
                    </Typography>
                  )}
                </React.Fragment>
              )}
              <Typography
                noWrap
                variant="h4"
                className={clsx(
                  classes.text,
                  !props.shouldRenderCurrentTime && isFuture && classes.textFuture,
                  !props.shouldRenderCurrentTime && isPast && classes.textPast,
                )}
              >
                {props.isOneLine && (
                  <span className={classes.meetingTimeInWordsDark}>
                    {format(props.meeting.start, 'p')}
                  </span>
                )}
                {props.meeting.summary || '(no title)'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {isDetailsVisible && props.isOneLine && (
          <Grid item style={{ paddingBottom: 0, paddingTop: 0 }}>
            <IconButton
              size={props.isOneLine ? 'small' : 'medium'}
              onClick={() => window.open(props.meeting.videoLink, '_blank')}
              className={buttonClasses.circleButton}
            >
              <VideoIcon width={'24'} height={'24'} />
            </IconButton>
          </Grid>
        )}
      </Grid>
      {isSelected && (
        <MeetingRowBelow
          meeting={props.meeting}
          store={props.store}
          shouldPadLeft={!props.hideDot}
        />
      )}
    </div>
  );
};

export default MeetingRow;
