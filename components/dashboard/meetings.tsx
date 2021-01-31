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
import { Route, useLocation } from 'react-router-dom';
import config from '../../constants/config';
import ExpandedMeeting from '../meeting/expand-meeting';
import MeetingRow from '../meeting/meeting-row';
import useButtonStyles from '../shared/button-styles';
import panelStyles from '../shared/panel-styles';
import PopperContainer from '../shared/popper';
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
  setReferenceElement: any;
  meetings: ISegment[];
  store: IStore;
  day: string;
  selectedMeetingId: string | null;
}) => {
  const currentTime = new Date();
  const classes = panelStyles();
  const dayContainerclasses = dayContainerStyles();

  let hasRenderedCurrentTime = false;
  const byDay = props.meetings.sort((a, b) => (a.start > b.start ? 1 : -1));
  return (
    <div className={classes.row}>
      <Day day={new Date(props.day)} currentDay={currentTime} />
      {byDay.map((meeting) => {
        let shouldRenderCurrentTime = false;
        if (!hasRenderedCurrentTime && meeting.start > currentTime) {
          hasRenderedCurrentTime = true;
          shouldRenderCurrentTime = true;
        }
        return (
          <div key={meeting.id} ref={shouldRenderCurrentTime ? props.setReferenceElement : null}>
            {shouldRenderCurrentTime && (
              <ListItem
                className={dayContainerclasses.currentTime}
                ref={shouldRenderCurrentTime ? props.setReferenceElement : null}
              >
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

const MeetingsByDay = (props: { store: IStore }) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const selectedMeetingId = useLocation().pathname.replace('/meetings/', '').replace('/', '');

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay();
      setMeetingsByDay(result);
    };
    void fetchData();
  }, []);

  const classes = panelStyles();
  const buttonClasses = useButtonStyles();
  const days = Object.keys(meetingsByDay).sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1));
  const currentTitle = 'Meeting Schedule';
  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container justify="flex-end">
          <Button
            className={buttonClasses.unSelected}
            onClick={() => referenceElement?.scrollIntoView({ behavior: 'auto', block: 'center' })}
          >
            Now
          </Button>
        </Grid>
      </TopBar>
      {days.map((day) => (
        <DayContainer
          key={day}
          day={day}
          setReferenceElement={setReferenceElement}
          meetings={meetingsByDay[day]}
          selectedMeetingId={selectedMeetingId}
          store={props.store}
        />
      ))}
    </div>
  );
};

const Meetings = (props: IStore) => <MeetingsByDay store={props} />;

export default Meetings;
