import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import {
  addDays,
  addWeeks,
  differenceInMinutes,
  format,
  isSameDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { times } from 'lodash';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import { responseStatus } from '../fetch/fetch-calendar-events';
import ExpandedMeeting from '../meeting/expand-meeting';
import PopperContainer from '../shared/popper';
import TopBar from '../shared/top-bar';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const leftSpacer = 40;
const topNavHeight = 110;
const hourHeight = 38;
const mainNavHeight = 72;
const scrollBarWidth = 15;
const shouldShowCalendarEvents = true;
const CURRENT_TIME_ELEMENT_ID = 'meeting-at-current-time';

const getTopForTime = (date: Date) =>
  hourHeight * date.getHours() + hourHeight * (date.getMinutes() / 60);

/**
 * titlerow    || day-title | day-title
 *  --------------
 * hourlabels  || day colummn   |  day column
 *                    hour row  |    hour row
 *                    hour row  |    hour row
 *                       event  |
 */

const useHourRowStyles = makeStyles((theme) => ({
  hour: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: hourHeight,
    flex: 1,
  },
}));

const HourRows = () => {
  const classes = useHourRowStyles();
  const hours = times(24).map((hour) => <Grid item key={hour} className={classes.hour}></Grid>);
  return <React.Fragment>{hours}</React.Fragment>;
};

const useDayTitleStyles = makeStyles((theme) => ({
  currentDay: {
    borderRadius: '50%',
    background: config.BLUE_BACKGROUND,
    marginLeft: theme.spacing(0.5),
  },
  day: {
    width: 27,
    height: 27,
    display: 'inline-block',
    padding: 3,
    fontWeight: theme.typography.fontWeightMedium,
  },
  dayOfWeek: {
    display: 'inline-block',
  },
  dayContainer: {
    color: theme.palette.secondary.light,
    textTransform: 'uppercase',
    fontSize: theme.typography.subtitle2.fontSize,
    marginTop: 3,
  },
}));

const DayTitle = (props: { day: Date }) => {
  const isToday = isSameDay(props.day, new Date());
  const classes = useDayTitleStyles();
  return (
    <div className={classes.dayContainer}>
      <Typography className={classes.dayOfWeek}>{format(props.day, 'EEE')}</Typography>
      <Typography className={clsx(classes.day, isToday && classes.currentDay)}>
        {format(props.day, 'd')}
      </Typography>
    </div>
  );
};

const useTitleRowStyles = makeStyles((theme) => ({
  container: {
    width: `calc(100% - ${scrollBarWidth}px)`,
    height: topNavHeight,
  },
  border: {
    width: 1,
    height: 27,
    background: theme.palette.divider,
    marginTop: -30,
  },
  item: {
    flex: 1,
    height: 27,
    textAlign: 'center',
  },
  spacer: {
    width: leftSpacer,
  },
  heading: {
    padding: theme.spacing(2),
    paddingBottom: 0,
  },
}));

const TitleRow = (props: {
  start: Date;
  onTodayClick: () => void;
  onBackClick: () => void;
  onForwardClick: () => void;
}) => {
  const classes = useTitleRowStyles();
  return (
    <div className={classes.container}>
      <TopBar title={format(props.start, 'LLLL') + ' ' + format(props.start, 'uuuu')}>
        <Grid container justify="flex-end">
          <Button onClick={props.onBackClick}>
            <ChevronLeftIcon />
          </Button>
          <Button onClick={props.onTodayClick}>Today</Button>
          <Button onClick={props.onForwardClick}>
            <ChevronRightIcon />
          </Button>
        </Grid>
      </TopBar>
      <Grid container>
        <Grid item className={classes.spacer}></Grid>
        <Grid item className={classes.item}>
          <DayTitle day={props.start} />
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <DayTitle day={addDays(props.start, 1)} />
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <DayTitle day={addDays(props.start, 2)} />
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <DayTitle day={addDays(props.start, 3)} />
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <DayTitle day={addDays(props.start, 4)} />
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <DayTitle day={addDays(props.start, 5)} />
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <DayTitle day={addDays(props.start, 6)} />
          <div className={classes.border}></div>
        </Grid>
      </Grid>
    </div>
  );
};

const useHourLabelStyles = makeStyles((theme) => ({
  container: {
    width: leftSpacer,
    color: theme.palette.text.hint,
    marginTop: mainNavHeight,
  },
  hour: {
    height: hourHeight,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  border: {
    background: theme.palette.divider,
    width: 5,
    height: 1,
    display: 'flex',
    marginTop: -1,
  },
  text: {
    background: '#fff', // Odd this is not white: theme.palette.background.default,
    paddingRight: 3,
    marginTop: -7,
    fontSize: 10,
    display: 'flex',
  },
}));

const HourLabels = () => {
  const currentDay = new Date();
  const classes = useHourLabelStyles();
  const hours = times(24).map((hour, index) => {
    const day = currentDay.setHours(hour);
    return (
      <Grid item key={hour} className={classes.hour}>
        <div className={classes.text}>{index > 0 && format(day, 'hh:00')}</div>
        <div className={classes.border}></div>
      </Grid>
    );
  });
  return (
    <Grid container className={classes.container}>
      {hours}
    </Grid>
  );
};

const useCalendarItemStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 1,
    borderRadius: theme.shape.borderRadius,
    flex: 1,
    overflow: 'hidden',
    background: theme.palette.primary.main,
    width: '100%',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    minHeight: hourHeight / 4,
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.8,
    },
  },
  containerRight: {
    left: 'auto',
    right: 1,
    width: '45%',
  },
  title: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.background.paper,
    lineHeight: '15.3px',
    marginTop: 2,
  },
  smallTitle: {
    marginTop: -2,
  },
  documentBackground: {
    background: config.PINK_BACKGROUND,
  },
  tentative: {
    backgroundSize: '12px 12px',
    backgroundImage:
      'linear-gradient(45deg,transparent,transparent 40%,rgba(0,0,0,0.2) 40%,rgba(0,0,0,0.2) 50%,transparent 50%,transparent 90%,rgba(0,0,0,0.2) 90%,rgba(0,0,0,0.2))',
  },
}));

interface ICalendarItemProps {
  title: string;
  start: Date;
  end?: Date;
  status: responseStatus;
  store: IStore;
  id: string;
}

const calendarItemPadding = 1;

const CalendarItem = (props: ICalendarItemProps) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const classes = useCalendarItemStyles();
  const minuteHeight = hourHeight / 60;
  const height = props.end
    ? Math.abs(differenceInMinutes(props.start, props.end) * minuteHeight) - calendarItemPadding
    : 100;
  const top = getTopForTime(props.start);
  return (
    <div
      className={clsx(classes.container, props.status === 'tentative' && classes.tentative)}
      style={{ height, top }}
      ref={setReferenceElement as any}
      onClick={() => setIsOpen(true)}
    >
      {referenceElement && (
        <PopperContainer
          anchorEl={referenceElement}
          isOpen={isOpen}
          setIsOpen={(isOpen) => setIsOpen(isOpen)}
          offset="140, -250"
        >
          <ExpandedMeeting
            meetingId={props.id}
            close={() => setIsOpen(false)}
            store={props.store}
          />
        </PopperContainer>
      )}
      <Typography className={clsx(classes.title, height < 10 && classes.smallTitle)}>
        <span style={{ fontWeight: 500 }}>{props.title}</span>, {format(props.start, 'hh:mm')}
      </Typography>
    </div>
  );
};

/**
 *
 * This should manage intersections
 * Potentially, it could have an array of all items that each calendar item adds to
 * each item would then check if it is inside a prior box, and if so, add a class/move them
 */
interface IDayContentProps {
  shouldShowCalendarEvents: boolean;
  store: IStore;
  day: Date;
}

const useDayContentStyles = makeStyles((theme) => ({
  currentTime: {
    left: 1,
    position: 'absolute',
    padding: 0,
    margin: 0,
    marginTop: -6,
    marginLeft: -6,
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

const DayContent = (props: IDayContentProps) => {
  let segmentsHtml = '' as any;
  let currentTimeHtml = '' as any;
  const currentDay = new Date();
  const classes = useDayContentStyles();
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [segments, setSegments] = useState<ISegment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.timeDataStore.getSegmentsForDay(props.day);
      setSegments(result);
    };
    void fetchData();
  }, [props.day]);

  if (isSameDay(currentDay, props.day)) {
    const top = getTopForTime(currentDay);
    currentTimeHtml = (
      <ListItem
        style={{ top }}
        ref={setReferenceElement as any}
        className={classes.currentTime}
        id={CURRENT_TIME_ELEMENT_ID}
      >
        <div className={classes.currentTimeDot}></div>
        <div className={classes.currentTimeBorder}></div>
      </ListItem>
    );
  }

  if (props.shouldShowCalendarEvents) {
    segmentsHtml = segments.map((segment) => (
      <CalendarItem
        key={segment.id}
        id={segment.id}
        store={props.store}
        title={segment.summary || '(no title)'}
        start={segment.start}
        end={segment.end}
        status={segment.selfResponseStatus}
      />
    ));
  }

  // Scroll the current time thing into view
  useEffect(() => {
    if (isSameDay(currentDay, props.day) && referenceElement) {
      referenceElement.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [!!referenceElement]);

  return (
    <div>
      {segmentsHtml}
      {currentTimeHtml}
    </div>
  );
};

const useStyles = makeStyles(() => ({
  container: {
    background: 'white',
  },
  calendar: {
    height: `calc(100vh - ${topNavHeight}px - ${mainNavHeight}px)`,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
}));

const Calendar = (props: IStore) => {
  const classes = useStyles();
  const [start, setStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }),
  );
  const onTodayClick = () => {
    setStart(startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }));
  };
  const onForwardClick = () => {
    setStart(addWeeks(start, 1));
  };
  const onBackClick = () => {
    setStart(subWeeks(start, 1));
  };
  const dayColumn = times(7).map((day) => (
    <Grid item key={day} className={classes.dayColumn}>
      <HourRows />
      <DayContent
        shouldShowCalendarEvents={shouldShowCalendarEvents}
        store={props}
        day={addDays(start, day)}
      />
    </Grid>
  ));
  return (
    <div className={classes.container}>
      <TitleRow
        start={start}
        onBackClick={onBackClick}
        onForwardClick={onForwardClick}
        onTodayClick={onTodayClick}
      />
      <div className={classes.calendar}>
        <Grid container>
          <Grid item>
            <HourLabels />
          </Grid>
          {dayColumn}
        </Grid>
      </div>
    </div>
  );
};

export default Calendar;
