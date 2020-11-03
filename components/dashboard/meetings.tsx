import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, getDate, getMonth } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import MeetingRow from '../meeting/meeting-row';
import panelStyles from '../shared/panel-styles';
import { IStore } from '../store/use-store';

const dayStyles = makeStyles((theme) => ({
  day: {
    marginTop: theme.spacing(2),
  },
  dayNumber: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },
  dayNumberToday: {
    backgroundColor: config.BLUE_BACKGROUND,
  },
  dayInfo: {
    textTransform: 'uppercase',
    fontWeight: theme.typography.fontWeightBold,
  },
}));

const Day = (props: { day: Date; currentDay: Date }) => {
  const classes = dayStyles();
  const dayNumber = getDate(props.day);
  const monthNumber = getMonth(props.day);
  const dayInfo = format(props.day, 'MMM, EEE');

  const currentDayNumber = getDate(props.currentDay);
  const currentMonthNumber = getMonth(props.currentDay);
  const isToday = currentDayNumber == dayNumber && currentMonthNumber == monthNumber;
  return (
    <Grid container className={clsx(classes.day)} spacing={2} alignItems="center">
      <Avatar className={clsx(classes.dayNumber, isToday && classes.dayNumberToday)}>
        {dayNumber}
      </Avatar>
      <Grid item>
        <Typography variant="caption" className={classes.dayInfo}>
          {dayInfo}
        </Typography>
      </Grid>
    </Grid>
  );
};

const MeetingsByDay = (
  props: IStore & {
    selectedMeetingId: string | null;
  },
) => {
  const meetingsByDay = props.timeDataStore.getSegmentsByDay();
  const currentTime = new Date();
  const classes = panelStyles();
  const days = Object.keys(meetingsByDay).sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1));
  let hasRenderedCurrentTime = false;
  return (
    <div className={classes.panel}>
      {days.map((day) => (
        <div key={day} className={classes.row}>
          <Day day={new Date(day)} currentDay={currentTime} />
          {meetingsByDay[day]
            .sort((a, b) => (a.start > b.start ? 1 : -1))
            .map((meeting) => {
              let shouldRenderCurrentTime = false;
              if (!hasRenderedCurrentTime && meeting.start > currentTime) {
                hasRenderedCurrentTime = true;
                shouldRenderCurrentTime = true;
              }
              return (
                <MeetingRow
                  currentTime={currentTime}
                  shouldRenderCurrentTime={shouldRenderCurrentTime}
                  key={meeting.id}
                  meeting={meeting}
                  selectedMeetingId={props.selectedMeetingId}
                />
              );
            })}
        </div>
      ))}
    </div>
  );
};

const Meetings = (props: IStore) => {
  const selectedMeetingId = useRouter().query.slug as string;
  const [seconds, setSeconds] = useState(0);
  // rerender every 5 seconds to update the current calendar events
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);
  return <MeetingsByDay selectedMeetingId={selectedMeetingId} {...props} />;
};

export default Meetings;
