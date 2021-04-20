import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { mediumFontFamily } from '../../constants/theme';
import VideoIcon from '../../public/icons/video-white.svg';
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
    color: 'rgba(0,0,0,0.4)',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    display: 'inline-block',
    marginLeft: theme.spacing(1),
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
  const isHappeningNow = new Date() > props.meeting.start && new Date() < props.meeting.end;
  return (
    <div
      className={classes.container}
      onClick={() => {
        void router.push(`/meetings/${props.meeting.id}`);
        return false;
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          <IconButton
            onClick={() => window.open(props.meeting.videoLink, '_blank')}
            className={buttonClasses.circleButton}
            style={{ marginRight: 'auto' }}
          >
            <VideoIcon width="25" height="24" />
          </IconButton>
        </Grid>
        <Grid item xs={12}>
          {isHappeningNow && (
            <Typography variant="h3" className={classes.meetingTimeInWords}>
              Happening Now
            </Typography>
          )}
          {isFuture && (
            <Typography variant="h3" className={classes.meetingTimeInWords}>
              In {formatDistanceToNow(props.meeting.start)}
            </Typography>
          )}
          <Typography variant="h3">{props.meeting.summary || '(no title)'}</Typography>
        </Grid>
        <Grid item xs={12}>
          <MeetingRowBelow meeting={props.meeting} store={props.store} shouldPadLeft={false} />
        </Grid>
      </Grid>
    </div>
  );
};
