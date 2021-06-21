import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { addHours, format, intervalToDuration } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

const numberHours = 8;

const useMeetingLineStyles = makeStyles((theme) => ({
  line: {
    background: '#FFA685',
    height: 8,
    position: 'absolute',
    top: 0,
    cursor: 'pointer',
    transition: 'background 0.3s',
    borderRadius: 4,
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
  linePast: {
    background: '#D3DBD5',
  },
  lineCurrent: {
    background: theme.palette.secondary.main,
  },
}));

const MeetingLine = (props: { meeting: ISegment; pixelsPerMinute: number }) => {
  const classes = useMeetingLineStyles();
  const router = useHistory();

  const duration = intervalToDuration({
    start: props.meeting.start < new Date() ? new Date() : props.meeting.start,
    end: props.meeting.end,
  });
  const durationInMinutes = (duration.minutes || 0) + (duration.hours || 0) * 60;
  const width = props.pixelsPerMinute * durationInMinutes;

  const startTime = intervalToDuration({
    start: new Date(),
    end: props.meeting.start,
  });
  const startTimeDifferenceInMinutes =
    props.meeting.start < new Date() ? 0 : (startTime.minutes || 0) + (startTime.hours || 0) * 60;

  const left = props.pixelsPerMinute * startTimeDifferenceInMinutes;
  const currentTime = new Date();
  const isCurrent = currentTime > props.meeting.start && currentTime < props.meeting.end;
  const isPast = currentTime > props.meeting.end;
  return (
    <Tooltip
      title={`${props.meeting.summary || ''} from ${format(props.meeting.start, 'p')} – ${format(
        props.meeting.end,
        'p',
      )}`}
    >
      <div
        className={clsx(classes.line, isCurrent && classes.lineCurrent, isPast && classes.linePast)}
        style={{ width, left }}
        onClick={() => router.push(`/meetings/${props.meeting.id}`)}
      ></div>
    </Tooltip>
  );
};

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
    height: 30,
    overflowX: 'hidden',
  },
  overflowContainer: {},
  border: {
    height: 4,
    background: theme.palette.divider,
    width: '100%',
    position: 'absolute',
    top: 2,
    left: 0,
  },
  startTime: {
    position: 'absolute',
    left: 0,
    top: theme.spacing(1),
    zIndex: 2,
    color: theme.palette.text.hint,
    pointerEvents: 'none',
  },
  endTime: {
    position: 'absolute',
    right: 0,
    top: theme.spacing(1),
    zIndex: 2,
    color: theme.palette.text.hint,
    pointerEvents: 'none',
  },
  heading: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2),
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

  const pixelsPerMinute = elementWidth / (numberHours * 60);
  const startTime = new Date();
  const endTime = addHours(new Date(), numberHours);
  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsForDay(new Date());
      setMeetings(result.filter((m) => m.end > startTime && m.start < endTime));
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  return (
    <div className={classes.overflowContainer} ref={elementRef}>
      <div className={classes.container} ref={elementRef}>
        <div className={classes.border}></div>
        {meetings.map((meeting) => (
          <MeetingLine key={meeting.id} meeting={meeting} pixelsPerMinute={pixelsPerMinute} />
        ))}
        <Typography className={classes.startTime}>{format(new Date(), 'p')}</Typography>
        <Typography className={classes.endTime}>{format(endTime, 'p')}</Typography>
      </div>
    </div>
  );
};
