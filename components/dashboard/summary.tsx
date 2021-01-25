import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PeopleIcon from '@material-ui/icons/People';
import clsx from 'clsx';
import { addDays, addWeeks, format, isSameDay, startOfWeek, subDays, subWeeks } from 'date-fns';
import { times } from 'lodash';
import Link from 'next/link';
import React, { useState } from 'react';
import config from '../../constants/config';
import useButtonStyles from '../shared/button-styles';
import TopBar from '../shared/top-bar';
import { IFilters, uncommonPunctuation } from '../store/tfidf-store';
import { IStore } from '../store/use-store';

const numberWeeks = 4;
const daysInWeek = 7;
const topNavHeight = 99;
const fontMin = 12;
const fontMax = 18;

/**
 * titlerow    || day-title | day-title
 *  --------------
 * hourlabels  || day colummn   |  day column
 *                    hour row  |    hour row
 *                    hour row  |    hour row
 *                       event  |
 */

const useTitleRowStyles = makeStyles((theme) => ({
  container: {
    width: `100%`,
  },
  border: {
    width: 1,
    height: 16,
    background: theme.palette.divider,
    marginTop: -18,
  },
  item: {
    flex: 1,
    textAlign: 'center',
    height: 16,
  },
  heading: {
    padding: theme.spacing(2),
    paddingBottom: 0,
  },
  toggleText: {
    [theme.breakpoints.down('md')]: {
      display: 'none',
    },
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
  day: {
    color: theme.palette.secondary.light,
    textTransform: 'uppercase',
    fontSize: theme.typography.subtitle2.fontSize,
  },
}));

const TitleRow = (props: {
  start: Date;
  onTodayClick: () => void;
  onBackClick: () => void;
  onForwardClick: () => void;
  filters: IFilters;
  setFilter: (filter: IFilters) => void;
}) => {
  const classes = useTitleRowStyles();
  const buttonClasses = useButtonStyles();
  const isCalendarSelected = props.filters.meetings;
  const isDocsSelected = props.filters.docs;
  const isPeopleSelected = props.filters.people;
  const togglePeopleSelected = () => {
    props.setFilter({ ...props.filters, people: !props.filters.people });
  };
  const toggleCalendarSelected = () => {
    props.setFilter({ ...props.filters, meetings: !props.filters.meetings });
  };
  const toggleDocsSelected = () => {
    props.setFilter({ ...props.filters, docs: !props.filters.docs });
  };
  return (
    <div className={classes.container}>
      <TopBar title={format(props.start, 'LLLL') + ' ' + format(props.start, 'uuuu')}>
        <Grid container justify="flex-end" alignContent="center" alignItems="center">
          <Grid item xs>
            <Grid container spacing={2} justify="flex-end">
              <Grid item>
                <Button
                  className={isCalendarSelected ? buttonClasses.selected : buttonClasses.unSelected}
                  onClick={toggleCalendarSelected}
                  startIcon={<CalendarViewDayIcon />}
                >
                  <span className={classes.toggleText}>Meetings</span>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  className={isDocsSelected ? buttonClasses.selected : buttonClasses.unSelected}
                  onClick={toggleDocsSelected}
                  startIcon={<InsertDriveFileIcon />}
                >
                  <span className={classes.toggleText}>Documents</span>
                </Button>
              </Grid>
              <Grid item>
                <Button
                  className={isPeopleSelected ? buttonClasses.selected : buttonClasses.unSelected}
                  onClick={togglePeopleSelected}
                  startIcon={<PeopleIcon />}
                >
                  <span className={classes.toggleText}>People</span>
                </Button>
              </Grid>
            </Grid>
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
      </TopBar>
      <Grid container>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(props.start, 'EEE')}</div>
        </Grid>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(addDays(props.start, 1), 'EEE')}</div>
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(addDays(props.start, 2), 'EEE')}</div>
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(addDays(props.start, 3), 'EEE')}</div>
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(addDays(props.start, 4), 'EEE')}</div>
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(addDays(props.start, 5), 'EEE')}</div>
          <div className={classes.border}></div>
        </Grid>
        <Grid item className={classes.item}>
          <div className={classes.day}>{format(addDays(props.start, 6), 'EEE')}</div>
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
  isFirst: boolean;
  day: Date;
  hoveredItem?: string;
  setHoveredItem: (s: string) => void;
}

const useDayContentStyles = makeStyles((theme) => ({
  currentDay: {
    borderRadius: '50%',
    background: config.BLUE_BACKGROUND,
  },
  day: {
    width: 26,
    height: 26,
    display: 'inline-block',
    marginTop: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    fontSize: theme.typography.subtitle2.fontSize,
  },
  pastDay: {
    opacity: 0.6,
  },
  container: {
    width: '100%',
    textAlign: 'center',
    flex: 1,
    position: 'relative',
    borderLeft: `1px solid ${theme.palette.divider}`,
    height: `calc((100vh - ${topNavHeight}px) / ${numberWeeks})`,
    overflow: 'hidden',
  },
  noBorder: {
    borderLeft: `1px solid ${theme.palette.background.paper}`,
  },
  term: {
    display: 'inline-block',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    cursor: 'pointer',
    transition: 'color 0.3s',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.palette.primary.main,
    },
  },
  termSelected: {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
  },
}));

export const DayContent = (props: IDayContentProps) => {
  const today = new Date();
  const isToday = isSameDay(props.day, today);
  const isInPast = props.day < today;
  const classes = useDayContentStyles();

  // interpolation yay
  const scaleX = props.tfidfStore.tfidfMax - props.tfidfStore.tfidfMin;
  const scaleY = fontMax - fontMin;
  const scale = scaleX / scaleY;

  const terms = props.tfidfStore.getForDay(props.day).map((document) => (
    <Link href={`?tab=search&query=${document.term}`} key={document.term}>
      <Typography
        onMouseEnter={() => props.setHoveredItem(document.term)}
        onMouseLeave={() => props.setHoveredItem('')}
        className={clsx(classes.term, document.term === props.hoveredItem && classes.termSelected)}
        style={{ fontSize: document.tfidf / scale + fontMin }}
      >
        {document.term.split(uncommonPunctuation).join(' ')}
      </Typography>
    </Link>
  ));
  return (
    <Grid item className={clsx(classes.container, props.isFirst && classes.noBorder)}>
      <div
        className={clsx(
          classes.day,
          isToday && classes.currentDay,
          !isToday && isInPast && classes.pastDay,
        )}
      >
        {format(props.day, 'd')}
      </div>
      <div>{terms}</div>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  days: {
    height: `calc((100vh - ${topNavHeight}px) / ${numberWeeks})`,
    width: '100%',
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  week: {
    flex: 1,
    position: 'relative',
  },
}));

const getStart = () =>
  subDays(
    startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }),
    (numberWeeks - 1) * daysInWeek,
  );

const Summary = (props: IStore) => {
  const classes = useStyles();
  const [hoveredItem, setHoveredItem] = useState<string>();
  const [start, setStart] = useState<Date>(getStart());
  const [filters, setFilters] = useState<IFilters>({
    meetings: true,
    people: true,
    docs: true,
  });
  const onTodayClick = () => setStart(getStart());
  const onForwardClick = () => {
    setStart(
      startOfWeek(addWeeks(start, numberWeeks), {
        weekStartsOn: Number(config.WEEK_STARTS_ON) as any,
      }),
    );
  };
  const onBackClick = () => {
    setStart(
      startOfWeek(subWeeks(start, numberWeeks), {
        weekStartsOn: Number(config.WEEK_STARTS_ON) as any,
      }),
    );
  };
  const getDayColumn = (week: number) => {
    const days = times(daysInWeek).map((day) => addDays(start, day + week * daysInWeek));
    return days.map((day, index) => (
      <DayContent
        isFirst={index < 1}
        tfidfStore={props.tfidfStore}
        day={day}
        key={day.toISOString()}
        hoveredItem={hoveredItem}
        setHoveredItem={setHoveredItem}
      />
    ));
  };
  const dayRows = times(numberWeeks).map((week) => (
    <div key={week} className={classes.week}>
      <Grid container className={classes.days}>
        {getDayColumn(week)}
      </Grid>
    </div>
  ));
  const onSetFilterClick = (filters: IFilters) => {
    void props.tfidfStore.recomputeForFilters(props, filters);
    setFilters(filters);
  };
  return (
    <div>
      <TitleRow
        start={start}
        onBackClick={onBackClick}
        onForwardClick={onForwardClick}
        onTodayClick={onTodayClick}
        filters={filters}
        setFilter={onSetFilterClick}
      />
      <div>{dayRows}</div>
    </div>
  );
};

export default Summary;
