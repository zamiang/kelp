import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, getDate, getMonth } from 'date-fns';
import { Dictionary } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import config from '../../constants/config';
import MeetingRow from '../meeting/meeting-row';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const dayStyles = makeStyles((theme) => ({
  day: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
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
  currentTime: {
    marginTop: -6,
    paddingLeft: 33,
  },
  currentTimeDot: {
    borderRadius: '50%',
    height: 12,
    width: 12,
    background: theme.palette.primary.dark,
  },
  currentTimeBorder: {
    marginTop: 0,
    width: '100%',
    borderTop: `2px solid ${theme.palette.primary.dark}`,
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
    <Grid container className={clsx(classes.day)} spacing={1} alignItems="center">
      <Grid item>
        <Avatar className={clsx(classes.dayNumber, isToday && classes.dayNumberToday)}>
          {dayNumber}
        </Avatar>
      </Grid>
      <Grid item>
        <Typography variant="caption" className={classes.dayInfo}>
          {dayInfo}
        </Typography>
      </Grid>
    </Grid>
  );
};

const dayContainerStyles = makeStyles((theme) => ({
  currentTime: {
    marginTop: -6,
    paddingLeft: 33,
  },
  currentTimeDot: {
    borderRadius: '50%',
    height: 12,
    width: 12,
    background: theme.palette.primary.dark,
  },
  currentTimeBorder: {
    marginTop: 0,
    width: '100%',
    borderTop: `2px solid ${theme.palette.primary.dark}`,
  },
}));

const DayContainer = (props: {
  meetings: ISegment[];
  store: IStore;
  day: string;
  selectedMeetingId: string | null;
}) => {
  const currentTime = new Date();
  const classes = panelStyles();
  const dayContainerclasses = dayContainerStyles();

  let hasRenderedCurrentTime = false;
  return (
    <div className={classes.row}>
      <Day day={new Date(props.day)} currentDay={currentTime} />
      {props.meetings.map((meeting) => {
        let shouldRenderCurrentTime = false;
        if (!hasRenderedCurrentTime && meeting.start > currentTime) {
          hasRenderedCurrentTime = true;
          shouldRenderCurrentTime = true;
        }
        return (
          <div key={meeting.id} id={meeting.id}>
            {shouldRenderCurrentTime && (
              <ListItem className={dayContainerclasses.currentTime} id="current-time">
                <div className={dayContainerclasses.currentTimeDot}></div>
                <div className={dayContainerclasses.currentTimeBorder}></div>
              </ListItem>
            )}
            <MeetingRow
              shouldRenderCurrentTime={shouldRenderCurrentTime}
              meeting={meeting}
              selectedMeetingId={props.selectedMeetingId}
              store={props.store}
            />
          </div>
        );
      })}
    </div>
  );
};

const MeetingsByDay = (props: IStore) => {
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const selectedMeetingId = useLocation().pathname.replace('/meetings', '').replace('/', '');

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.timeDataStore.getSegmentsByDay();
      setMeetingsByDay(result);
    };
    void fetchData();
  }, [props.lastUpdated]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedMeetingId.length < 10) {
        document
          .getElementById('current-time')
          ?.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }, 300);
  }, []);

  const classes = panelStyles();
  const buttonClasses = useButtonStyles();
  const days = Object.keys(meetingsByDay);
  const currentTitle = 'Meeting Schedule';
  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container justify="flex-end">
          <Button
            className={buttonClasses.unSelected}
            onClick={() =>
              document
                .getElementById('current-time')
                ?.scrollIntoView({ behavior: 'auto', block: 'center' })
            }
          >
            Now
          </Button>
        </Grid>
      </TopBar>
      {days.map((day) => (
        <DayContainer
          key={day}
          day={day}
          meetings={meetingsByDay[day]}
          selectedMeetingId={selectedMeetingId}
          store={props}
        />
      ))}
    </div>
  );
};

export default MeetingsByDay;
