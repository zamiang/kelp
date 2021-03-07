import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import VideocamIcon from '@material-ui/icons/Videocam';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import isTouchEnabled from '../shared/is-touch-enabled';
import { ISegment } from '../store/models/segment-model';
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
    display: 'block',
    width: '100%',
    textAlign: 'left',
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
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
    borderRadius: 5,
    border: `2px solid`,
    marginRight: theme.spacing(1),
  },
  dotPast: {
    backgroundColor: theme.palette.grey[200],
    borderColor: theme.palette.grey[200],
  },
  dotFuture: {
    backgroundColor: theme.palette.grey[900],
    borderColor: theme.palette.grey[900],
  },
  dotPresent: {
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.grey[900],
  },
  iconContainer: {
    marginLeft: -20,
    marginRight: -2,
  },
  meetingTimeInWords: {
    color: theme.palette.secondary.dark,
    fontWeight: 600,
    display: 'inline-block',
    marginLeft: theme.spacing(1),
  },
}));

const MeetingRow = (props: {
  meeting: ISegment;
  selectedMeetingId: string | null;
  shouldRenderCurrentTime: boolean;
  store: IStore;
  isSmall?: boolean;
  isOpen?: boolean;
  hideDot?: boolean;
}) => {
  const classes = useStyles();
  const router = useHistory();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const isSelected = props.selectedMeetingId === props.meeting.id || props.isOpen;
  const [isVideoVisible, setVideoVisible] = useState(isTouchEnabled());

  useEffect(() => {
    if (isSelected && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  const isPast = new Date() > props.meeting.end;
  const isFuture = new Date() < props.meeting.start;

  return (
    <Button
      onClick={() => {
        void router.push(`/meetings/${props.meeting.id}`);
        return false;
      }}
      onMouseEnter={() => setVideoVisible(true)}
      onMouseLeave={() => setVideoVisible(false)}
      ref={setReferenceElement as any}
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
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography variant="body2" style={{ display: 'inline-block' }}>
                {format(props.meeting.start, 'p')} – {format(props.meeting.end, 'p')}
              </Typography>
              {props.shouldRenderCurrentTime && (
                <Typography className={classes.meetingTimeInWords}>
                  (In {formatDistanceToNow(props.meeting.start)})
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography noWrap>
                <span style={{ fontWeight: 500 }}>{props.meeting.summary || '(no title)'}</span>{' '}
                {!props.isSmall && props.meeting.description
                  ? props.meeting.description.replace(/<[^>]+>/g, '')
                  : ''}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        {isVideoVisible && props.meeting.videoLink && (
          <Grid item style={{ marginLeft: 'auto' }}>
            <IconButton aria-label="Join meeting" target="_blank" href={props.meeting.videoLink}>
              <VideocamIcon color="primary" />
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
    </Button>
  );
};

export default MeetingRow;
