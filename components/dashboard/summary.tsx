import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import { addDays, addMonths, format, isSameDay, startOfWeek, subDays, subMonths } from 'date-fns';
import { times } from 'lodash';
import Link from 'next/link';
import React, { useState } from 'react';
import config from '../../constants/config';
import { uncommonPunctuation } from '../store/tfidf-store';
import { IStore } from '../store/use-store';

const numberWeeks = 4;
const daysInWeek = 7;
const topNavHeight = 85;
const scrollBarWidth = 15;
const fontMin = 12;
const fontMax = 22;
const borderColor = '#dadce0';
/**
 * titlerow    || day-title | day-title
 *  --------------
 * hourlabels  || day colummn   |  day column
 *                    hour row  |    hour row
 *                    hour row  |    hour row
 *                       event  |
 */

const DayTitle = (props: { day: Date }) => (
  <React.Fragment>
    <Typography variant="h6">{format(props.day, 'EEE')}</Typography>
  </React.Fragment>
);

const useTitleRowStyles = makeStyles((theme) => ({
  container: {
    width: `calc(100% - ${scrollBarWidth}px)`,
    height: topNavHeight,
  },
  border: {
    width: 1,
    height: 19,
    background: theme.palette.secondary.light,
    marginTop: -15,
  },
  item: {
    flex: 1,
    textAlign: 'center',
    borderBottom: `1px solid ${borderColor}`,
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
      <Grid container justify="space-between" alignContent="center" alignItems="center">
        <Grid item>
          <Typography variant="h4" className={classes.heading}>
            <b>{format(props.start, 'LLLL')}</b> {format(props.start, 'uuuu')}
          </Typography>
        </Grid>
        <Grid item>
          <Button onClick={props.onBackClick}>
            <ChevronLeftIcon />
          </Button>
          <Button onClick={props.onTodayClick}>Today</Button>
          <Button onClick={props.onForwardClick}>
            <ChevronRightIcon />
          </Button>
        </Grid>
      </Grid>
      <Grid container>
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

/**
 *
 * This should manage intersections
 * Potentially, it could have an array of all items that each calendar item adds to
 * each item would then check if it is inside a prior box, and if so, add a class/move them
 */
interface IDayContentProps {
  tfidfStore: IStore['tfidfStore'];
  day: Date;
}

const useDayContentStyles = makeStyles((theme) => ({
  currentDay: {
    borderRadius: '50%',
    background: config.YELLOW_BACKGROUND,
    marginLeft: theme.spacing(0.5),
  },
  day: {
    width: 35,
    height: 35,
    display: 'inline-block',
    padding: 3,
  },
  container: {
    width: '100%',
    textAlign: 'center',
    flex: 1,
    position: 'relative',
    borderLeft: `1px solid ${borderColor}`,
    height: `calc((100vh - ${topNavHeight}px) / ${numberWeeks})`,
    overflow: 'hidden',
  },
  term: {
    display: 'inline-block',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const DayContent = (props: IDayContentProps) => {
  const isToday = isSameDay(props.day, new Date());
  const classes = useDayContentStyles();

  // interpolation yay
  const scaleX = props.tfidfStore.tfidfMax - props.tfidfStore.tfidfMin;
  const scaleY = fontMax - fontMin;
  const scale = scaleX / scaleY;

  const terms = props.tfidfStore.getForDay(props.day).map((document) => (
    <Link href={`?tab=search&query=${document.term}`} key={document.term}>
      <Typography className={classes.term} style={{ fontSize: document.tfidf / scale + fontMin }}>
        {document.term.split(uncommonPunctuation).join(' ')}
      </Typography>
    </Link>
  ));
  return (
    <Grid item className={classes.container}>
      <Typography className={clsx(classes.day, isToday && classes.currentDay)} variant="h6">
        {format(props.day, 'd')}
      </Typography>
      <div>{terms}</div>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  container: {},
  weeks: {},
  days: {
    height: `calc((100vh - ${topNavHeight}px) / ${numberWeeks})`,
    width: '100%',
    overflow: 'hidden',
    borderBottom: `1px solid ${borderColor}`,
  },
  week: {
    flex: 1,
    position: 'relative',
  },
}));

const Summary = (props: IStore) => {
  const classes = useStyles();
  const [start, setStart] = useState<Date>(
    subDays(
      startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }),
      (numberWeeks - 1) * daysInWeek,
    ),
  );
  const onTodayClick = () => {
    setStart(startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }));
  };
  const onForwardClick = () => {
    setStart(addMonths(start, 1));
  };
  const onBackClick = () => {
    setStart(subMonths(start, 1));
  };
  const getDayColumn = (week: number) => {
    const days = times(daysInWeek).map((day) => addDays(start, day + week * daysInWeek));
    return days.map((day) => (
      <DayContent tfidfStore={props.tfidfStore} day={day} key={day.toISOString()} />
    ));
  };
  const dayRows = times(numberWeeks).map((week) => (
    <div key={week} className={classes.week}>
      <Grid container className={classes.days}>
        {getDayColumn(week)}
      </Grid>
    </div>
  ));
  return (
    <div className={classes.container}>
      <TitleRow
        start={start}
        onBackClick={onBackClick}
        onForwardClick={onForwardClick}
        onTodayClick={onTodayClick}
      />
      <div className={classes.weeks}>{dayRows}</div>
    </div>
  );
};

export default Summary;
