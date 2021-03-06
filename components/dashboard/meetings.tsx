import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, getDate, getMonth } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MeetingRow from '../meeting/meeting-row';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import TopBar from '../shared/top-bar';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const dayStyles = makeStyles((theme) => ({
  day: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
  dayNumber: {
    color: 'rgba(0,0,0,0.3)',
    backgroundColor: '#E5E5E5',
    width: 40,
    height: 40,
  },
  dayNumberToday: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.background.paper,
  },
  dayInfo: {
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.87)',
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
        <Avatar
          alt={dayNumber.toString()}
          className={clsx(classes.dayNumber, isToday && classes.dayNumberToday)}
        >
          {dayNumber}
        </Avatar>
      </Grid>
      <Grid item>
        <Typography className={classes.dayInfo}>{dayInfo}</Typography>
      </Grid>
    </Grid>
  );
};

const dayContainerStyles = makeStyles((theme) => ({
  currentTime: {
    marginTop: -6,
    paddingLeft: 4,
  },
  currentTimeDot: {
    borderRadius: '50%',
    height: 12,
    width: 12,
    background: theme.palette.primary.dark,
  },
  currentTimeBorder: {
    marginTop: -6,
    width: '100%',
    borderTop: `2px solid ${theme.palette.primary.dark}`,
  },
}));

const DayContainer = (props: {
  meetings: ISegment[];
  store: IStore;
  day: string;
  selectedMeetingId: string | null;
  currentTimeMeetingId: string | null;
}) => {
  const currentTime = new Date();
  const classes = panelStyles();
  const dayContainerclasses = dayContainerStyles();
  const rowStyles = useRowStyles();

  return (
    <div className={classes.section}>
      <Day day={new Date(props.day)} currentDay={currentTime} />
      {props.meetings.map((meeting) => (
        <div
          key={meeting.id}
          id={meeting.id}
          className={clsx(
            'ignore-react-onclickoutside',
            rowStyles.row,
            meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
            meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
            meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
            meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
            meeting.end < new Date() && rowStyles.rowHint,
            props.selectedMeetingId === meeting.id && rowStyles.rowPrimaryMain,
          )}
        >
          {meeting.id === props.currentTimeMeetingId && (
            <div className={dayContainerclasses.currentTime} id="current-time">
              <div className={dayContainerclasses.currentTimeDot}></div>
              <div className={dayContainerclasses.currentTimeBorder}></div>
            </div>
          )}
          <MeetingRow
            shouldRenderCurrentTime={meeting.id === props.currentTimeMeetingId}
            meeting={meeting}
            selectedMeetingId={props.selectedMeetingId}
            store={props.store}
          />
        </div>
      ))}
    </div>
  );
};

const scrollCurrentTimeIntoView = () => {
  document.getElementById('current-time')?.scrollIntoView({ behavior: 'auto', block: 'center' });
};

const MeetingsByDay = (props: { store: IStore; hideHeading?: boolean }) => {
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const selectedMeetingId = useLocation().pathname.replace('/meetings', '').replace('/', '');

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay();
      setMeetingsByDay(result);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  useEffect(() => {
    setTimeout(() => {
      if (selectedMeetingId.length < 10) {
        scrollCurrentTimeIntoView();
      }
    }, 300);
  }, [props.store.lastUpdated, props.store.isLoading]);

  const classes = panelStyles();
  const days = Object.keys(meetingsByDay);
  const currentTitle = 'Meeting Schedule';

  let hasRenderedCurrentTime = false;
  const currentTime = new Date();
  const currentTimeId = flatten(Object.values(meetingsByDay)).filter((meeting) => {
    let shouldRenderCurrentTime = false;
    if (!hasRenderedCurrentTime && meeting.start > currentTime) {
      hasRenderedCurrentTime = true;
      shouldRenderCurrentTime = true;
    }
    return shouldRenderCurrentTime;
  })[0]?.id;

  if (props.hideHeading) {
    return (
      <React.Fragment>
        {days.map((day) => (
          <DayContainer
            key={day}
            day={day}
            meetings={meetingsByDay[day]}
            selectedMeetingId={selectedMeetingId}
            store={props.store}
            currentTimeMeetingId={currentTimeId}
          />
        ))}
      </React.Fragment>
    );
  }

  return (
    <div className={classes.panel}>
      <TopBar title={currentTitle}>
        <Grid container justify="flex-end">
          <Button onClick={() => scrollCurrentTimeIntoView()}>Today</Button>
        </Grid>
      </TopBar>
      {days.map((day) => (
        <DayContainer
          key={day}
          day={day}
          meetings={meetingsByDay[day]}
          selectedMeetingId={selectedMeetingId}
          store={props.store}
          currentTimeMeetingId={currentTimeId}
        />
      ))}
    </div>
  );
};

export default MeetingsByDay;
