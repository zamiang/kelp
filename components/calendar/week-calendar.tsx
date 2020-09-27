import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { addDays, differenceInMinutes, format, startOfWeek } from 'date-fns';
import { times } from 'lodash';
import React from 'react';
import config from '../../constants/config';
import { IStore } from '../store/use-store';

const leftSpacer = 40;
const topNavHeight = 100;
const hourHeight = 48;
const scrollBarWidth = 15;
const borderColor = '#dadce0';

/**
 * titlerow    || day-title | day-title
 *  --------------
 * hourlabels  || day colummn   |  day column
 *                    hour row  |    hour row
 *                    hour row  |    hour row
 *                       event  |
 */

const useHourRowStyles = makeStyles(() => ({
  hour: {
    borderBottom: `1px solid ${borderColor}`,
    borderLeft: `1px solid ${borderColor}`,
    height: hourHeight,
    flex: 1,
  },
}));

const HourRows = () => {
  const classes = useHourRowStyles();
  const hours = times(24).map((hour) => <Grid item key={hour} className={classes.hour}></Grid>);
  return <React.Fragment>{hours}</React.Fragment>;
};

const DayTitle = (props: { day: Date }) => (
  <React.Fragment>
    <Typography variant="h6">{format(props.day, 'EEE')}</Typography>
    <Typography variant="h3">{format(props.day, 'd')}</Typography>
  </React.Fragment>
);

const useTitleRowStyles = makeStyles((theme) => ({
  container: {
    height: topNavHeight,
    width: `calc(100% - ${scrollBarWidth}px)`,
  },
  border: {
    width: 1,
    height: 30,
    background: borderColor,
    marginTop: -22,
  },
  item: {
    paddingTop: theme.spacing(2),
    flex: 1,
    textAlign: 'center',
    borderBottom: `1px solid ${borderColor}`,
  },
  spacer: {
    width: leftSpacer,
  },
}));

const TitleRow = (props: { start: Date }) => {
  const classes = useTitleRowStyles();

  return (
    <Grid container className={classes.container}>
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
  );
};

const useHourLabelStyles = makeStyles((theme) => ({
  container: {
    width: leftSpacer,
    color: theme.palette.text.hint,
  },
  hour: {
    height: hourHeight,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  border: {
    background: borderColor,
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
  const hours = times(24).map((hour) => {
    const day = currentDay.setHours(hour);
    return (
      <Grid item key={hour} className={classes.hour}>
        <div className={classes.text}>{format(day, 'hh:00')}</div>
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

interface ICalendarItemProps {
  onClick: () => void;
  title: string;
  subtitle: string;
  start: Date;
  end?: Date;
}

const useCalendarItemStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 1,
    borderRadius: theme.shape.borderRadius,
    flex: 1,
    overflow: 'hidden',
    background: theme.palette.primary.light,
    width: '90%',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  title: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
  },
}));

const CalendarItem = (props: ICalendarItemProps) => {
  const classes = useCalendarItemStyles();
  const minuteHeight = hourHeight / 60;
  const height = props.end
    ? Math.abs(differenceInMinutes(props.start, props.end) * minuteHeight)
    : 100;
  const top = hourHeight * props.start.getHours();
  return (
    <div className={classes.container} style={{ height, top, minHeight: hourHeight / 4 }}>
      <Typography className={classes.title}>{props.title}</Typography>
      <Typography className={classes.subtitle}>{props.subtitle}</Typography>
    </div>
  );
};

const DayContent = (props: { timeStore: IStore['timeDataStore']; day: Date }) => {
  const segments = props.timeStore.getSegmentsForDay(props.day);
  const segmentHtml = segments.map((segment) => (
    <CalendarItem
      key={segment.id}
      title={segment.summary || segment.id}
      subtitle={'foo'}
      start={segment.start}
      end={segment.end}
      onClick={() => alert('clicked')}
    />
  ));
  return <div>{segmentHtml}</div>;
};

const useStyles = makeStyles(() => ({
  container: {},
  calendar: {
    height: `calc(100vh - ${topNavHeight}px)`,
    overflow: 'scroll',
  },
  dayColumn: {
    flex: 1,
    position: 'relative',
  },
}));

const Calendar = (props: IStore) => {
  const classes = useStyles();
  const start = startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any });
  const dayColumn = times(7).map((day) => (
    <Grid item key={day} className={classes.dayColumn}>
      <HourRows />
      <DayContent timeStore={props.timeDataStore} day={addDays(start, day)} />
    </Grid>
  ));
  return (
    <div className={classes.container}>
      <TitleRow start={start} />
      <Grid container className={classes.calendar}>
        <Grid item>
          <HourLabels />
        </Grid>
        {dayColumn}
      </Grid>
    </div>
  );
};

export default Calendar;
