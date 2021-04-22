import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format } from 'date-fns';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { mediumFontFamily } from '../../constants/theme';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';
import MeetingRowBelow from './meeting-row-below';

const useStyles = makeStyles((theme) => ({
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing(2),
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
  text: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  textPast: { color: 'rgba(0,0,0,0.3)' },
  textFuture: {},
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
  isOpen?: boolean;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const isSelected = props.selectedMeetingId === props.meeting.id || props.isOpen;

  const isPast = new Date() > props.meeting.end;
  const isFuture = new Date() < props.meeting.start;
  return (
    <div
      onClick={() => {
        void router.push(`/meetings/${props.meeting.id}`);
        return false;
      }}
      className={classes.container}
    >
      <Grid container alignItems="center">
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
        <Grid item xs zeroMinWidth className={classes.smallContainer}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography
                noWrap
                variant="h4"
                className={clsx(
                  classes.text,

                  !props.shouldRenderCurrentTime && isFuture && classes.textFuture,
                  !props.shouldRenderCurrentTime && isPast && classes.textPast,
                )}
              >
                <span className={classes.meetingTimeInWordsDark}>
                  {format(props.meeting.start, 'p')}
                </span>
                {props.meeting.summary || '(no title)'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      {isSelected && <MeetingRowBelow meeting={props.meeting} store={props.store} shouldPadLeft />}
    </div>
  );
};

export default MeetingRow;
