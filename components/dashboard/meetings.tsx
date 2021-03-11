import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, getDate, getMonth, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { mediumFontFamily } from '../../constants/theme';
import MeetingRow from '../meeting/meeting-row';
import MeetingBar from '../meeting/meeting-top-bar';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const dayStyles = makeStyles((theme) => ({
  day: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  dayNumber: {
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.87)',
  },
  dayNumberToday: {
    color: theme.palette.primary.main,
  },
  dayNumberPast: {},
  currentTime: {
    marginTop: -6,
    paddingLeft: 33,
  },
  currentTimeDot: {
    borderRadius: '50%',
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
  const dayInfo = format(props.day, 'EEE MMM d');
  const currentDayNumber = getDate(props.currentDay);
  const currentMonthNumber = getMonth(props.currentDay);
  const isPast = props.day < props.currentDay;
  const isToday = currentDayNumber == dayNumber && currentMonthNumber == monthNumber;
  return (
    <div className={classes.day} id={`${dayNumber}-day`}>
      <Typography
        className={clsx(
          classes.dayNumber,
          isToday && classes.dayNumberToday,
          !isToday && isPast && classes.dayNumberPast,
        )}
      >
        {isToday ? 'Today ‧ ' : ''}
        {dayInfo}
      </Typography>
    </div>
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
  currentTimeMeetingId?: string;
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
            <div className={dayContainerclasses.currentTime} id="current-time"></div>
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

const FeaturedMeeting = (props: { meeting: ISegment; store: IStore }) => {
  const rowStyles = useRowStyles();
  return (
    <div className={clsx(rowStyles.rowHighlight, rowStyles.rowHighlightPadding)}>
      <br />
      <MeetingRow
        shouldRenderCurrentTime={false}
        meeting={props.meeting}
        selectedMeetingId={props.meeting.id}
        store={props.store}
        hideDot
      />
    </div>
  );
};

const scrollDayIntoView = (date: Date) => {
  document
    .getElementById(`${getDate(date)}-day`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const scrollCurrentTimeIntoView = () => {
  document.getElementById('current-time')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const DAYS_BACK = 1;

const MeetingsByDay = (props: { store: IStore }) => {
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  let selectedMeetingId = useLocation().pathname.replace('/meetings', '').replace('/', '');

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay(
        subDays(new Date(), DAYS_BACK),
      );
      setMeetingsByDay(result);
    };
    void fetchData();
  }, [props.store.lastUpdated, props.store.isLoading]);

  const classes = panelStyles();
  const days = Object.keys(meetingsByDay);

  let featuredMeeting: ISegment | undefined;
  const currentTime = new Date();
  // Assumes meetings are already sorted
  flatten(Object.values(meetingsByDay)).forEach((meeting) => {
    if (!featuredMeeting && currentTime < meeting.end) {
      featuredMeeting = meeting;
    }
  });

  if (window.innerWidth > 800 && !selectedMeetingId && featuredMeeting) {
    selectedMeetingId = featuredMeeting.id;
  }

  return (
    <div className={classes.panel}>
      <MeetingBar
        store={props.store}
        selectedDay={selectedDay}
        onDayClick={(d: Date) => {
          setSelectedDay(d);
          scrollDayIntoView(d);
        }}
        currentDay={new Date()}
        onNowClick={() => {
          setSelectedDay(new Date());
          scrollCurrentTimeIntoView();
        }}
      />
      {featuredMeeting && <FeaturedMeeting meeting={featuredMeeting} store={props.store} />}
      {days.map((day) => (
        <DayContainer
          key={day}
          day={day}
          meetings={meetingsByDay[day]}
          selectedMeetingId={selectedMeetingId}
          store={props.store}
          currentTimeMeetingId={featuredMeeting?.id}
        />
      ))}
    </div>
  );
};

export default MeetingsByDay;
