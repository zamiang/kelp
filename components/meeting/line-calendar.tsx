import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { addDays, format, intervalToDuration } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

const useMeetingLineStyles = makeStyles((theme) => ({
  line: {
    background: theme.palette.secondary.main,
    height: theme.spacing(2),
    position: 'absolute',
    top: -theme.spacing(1),
    cursor: 'pointer',
    transition: 'background 0.3s',
    borderRadius: 4,
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
}));

const MeetingLine = (props: { meeting: ISegment; pixelsPerMinute: number }) => {
  const classes = useMeetingLineStyles();
  const router = useHistory();

  const duration = intervalToDuration({
    start: props.meeting.start,
    end: props.meeting.end,
  });
  const durationInMinutes = (duration.minutes || 0) + (duration.hours || 0) * 60;
  const width = props.pixelsPerMinute * durationInMinutes;

  const startTime = intervalToDuration({
    start: new Date(),
    end: props.meeting.start,
  });
  const startTimeDifferenceInMinutes = (startTime.minutes || 0) + (startTime.hours || 0) * 60;

  const left = props.pixelsPerMinute * startTimeDifferenceInMinutes;

  return (
    <Tooltip
      title={`${props.meeting.summary || ''} from ${format(props.meeting.start, 'p')} – ${format(
        props.meeting.end,
        'p',
      )}`}
    >
      <div
        className={classes.line}
        style={{ width, left }}
        onClick={() => router.push(`/meetings/${props.meeting.id}`)}
      ></div>
    </Tooltip>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    borderTop: `2px solid ${theme.palette.divider}`,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    position: 'relative',
    height: 28,
  },
  overflowContainer: {},
  startTime: {
    position: 'absolute',
    left: 0,
    top: theme.spacing(1),
  },
  endTime: {
    position: 'absolute',
    right: 0,
    top: theme.spacing(1),
  },
}));

export const LineCalendar = (props: { store: IStore }) => {
  const classes = useStyles();
  const elementRef = useRef(null);
  const [meetings, setMeetings] = useState<ISegment[]>([]);
  const [elementWidth, setElementWidth] = useState(0);

  useEffect(() => {
    const current = elementRef?.current as any;
    if (current) {
      setElementWidth(current.getBoundingClientRect().width);
    }
  }, []); //empty dependency array so it only runs once at render

  const pixelsPerMinute = elementWidth / (12 * 60);
  useEffect(() => {
    const fetchData = async () => {
      let result = await props.store.timeDataStore.getSegmentsForDay(new Date());
      if (result.length < 1) {
        result = await props.store.timeDataStore.getSegmentsForDay(addDays(new Date(), 1));
      }
      setMeetings(result);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <div className={classes.overflowContainer} ref={elementRef}>
      <div className={classes.container} ref={elementRef}>
        {meetings.map((meeting) => (
          <MeetingLine key={meeting.id} meeting={meeting} pixelsPerMinute={pixelsPerMinute} />
        ))}
        <Typography variant="caption" className={classes.startTime}>
          {format(new Date(), 'p')}
        </Typography>
        <Typography variant="caption" className={classes.endTime}>
          {format(new Date(), 'p')}
        </Typography>
      </div>
    </div>
  );
};
