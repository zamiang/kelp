import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { format, getDate, getMonth, setHours, setMinutes, subDays } from 'date-fns';
import { Dictionary, flatten } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PlusIcon from '../../public/icons/plus.svg';
import { FeaturedMeeting } from '../meeting/featured-meeting';
import MeetingRow from '../meeting/meeting-row';
import MeetingBar from '../meeting/meeting-top-bar';
import panelStyles from '../shared/panel-styles';
import useRowStyles from '../shared/row-styles';
import { ISegment } from '../store/data-types';
import { IStore } from '../store/use-store';

const shouldRenderMeetingsBar = false;

const dayStyles = makeStyles((theme) => ({
  day: {
    marginTop: theme.spacing(2),
  },
  dayNumberToday: {
    color: theme.palette.primary.main,
  },
  dayNumberPast: {},
}));

const Day = (props: { day: Date; currentDay: Date }) => {
  const classes = dayStyles();
  const rowStyles = useRowStyles();
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
        variant="h6"
        className={clsx(
          rowStyles.heading,
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
}));

const getClassesForMeeting = (
  meeting: ISegment,
  rowStyles: any,
  selectedMeetingId: string | null,
) =>
  clsx(
    rowStyles.row,
    meeting.selfResponseStatus === 'accepted' && rowStyles.rowDefault,
    meeting.selfResponseStatus === 'tentative' && rowStyles.rowHint,
    meeting.selfResponseStatus === 'declined' && rowStyles.rowLineThrough,
    meeting.selfResponseStatus === 'needsAction' && rowStyles.rowHint,
    meeting.end < new Date() && rowStyles.rowHint,
    selectedMeetingId === meeting.id && rowStyles.rowPrimaryMain,
  );

const DayContainer = (props: {
  meetings: ISegment[];
  store: IStore;
  day: string;
  selectedMeetingId: string | null;
  currentTimeMeetingId?: string;
  shouldHidePastMeetings: boolean;
}) => {
  const currentTime = new Date();
  const classes = panelStyles();
  const dayContainerclasses = dayContainerStyles();
  const rowStyles = useRowStyles();
  const [isHidden, setIsHidden] = useState<Boolean>(false);
  const meetings = props.meetings.filter((meeting) => meeting.end > new Date());
  const pastMeetings = props.meetings.filter((meeting) => meeting.end < new Date());
  return (
    <div className={classes.section}>
      <Day day={new Date(props.day)} currentDay={currentTime} />
      <div style={{ display: isHidden ? 'block' : 'none' }}>
        {pastMeetings.map((meeting) => (
          <div
            key={meeting.id}
            id={meeting.id}
            className={getClassesForMeeting(meeting, rowStyles, props.selectedMeetingId)}
          >
            <MeetingRow
              shouldRenderCurrentTime={false}
              meeting={meeting}
              selectedMeetingId={props.selectedMeetingId}
              store={props.store}
            />
          </div>
        ))}
      </div>
      {pastMeetings.length > 0 && !isHidden && (
        <Typography className={classes.panelTextButton} onClick={() => setIsHidden(true)}>
          <PlusIcon width="18" height="18" style={{ verticalAlign: 'sub' }} />
          Show {pastMeetings.length} earlier meetings
        </Typography>
      )}
      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          id={meeting.id}
          className={getClassesForMeeting(meeting, rowStyles, props.selectedMeetingId)}
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

const scrollDayIntoView = (date: Date) => {
  document
    .getElementById(`${getDate(date)}-day`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const scrollCurrentTimeIntoView = () => {
  document.getElementById('current-time')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const DAYS_BACK = 0;

const MeetingsByDay = (props: { store: IStore; setMeetingId?: (id: string) => void }) => {
  const [meetingsByDay, setMeetingsByDay] = useState<Dictionary<ISegment[]>>({});
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const selectedMeetingId = useLocation().pathname.replace('/meetings', '').replace('/', '');

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsByDay(
        subDays(setMinutes(setHours(new Date(), 0), 0), DAYS_BACK),
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
      if (props.setMeetingId) {
        props.setMeetingId(meeting.id);
      }
    }
  });

  return (
    <div className={classes.panel}>
      {shouldRenderMeetingsBar && (
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
      )}
      {featuredMeeting && <FeaturedMeeting meeting={featuredMeeting} store={props.store} />}
      {days.map((day) => (
        <DayContainer
          key={day}
          day={day}
          meetings={meetingsByDay[day]}
          selectedMeetingId={selectedMeetingId}
          store={props.store}
          currentTimeMeetingId={featuredMeeting?.id}
          shouldHidePastMeetings={true}
        />
      ))}
    </div>
  );
};

export default MeetingsByDay;
