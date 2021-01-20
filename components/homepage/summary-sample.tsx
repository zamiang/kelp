import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { addDays } from 'date-fns';
import { times } from 'lodash';
import React from 'react';
import { DayContent } from '../dashboard/summary';
import TfidfStore from '../store/tfidf-store';
import { IStore } from '../store/use-store';

const daysInWeek = 3;
const numberWeeks = 1;
const setHoveredItem = () => null;
const start = new Date();
const filters = { meetings: true, people: true, docs: true };

const useStyles = makeStyles((theme) => ({
  summary: {
    borderRight: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
  },
  days: {
    // height: 260,
    width: '100%',
    overflow: 'hidden',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  week: {
    flex: 1,
    position: 'relative',
  },
}));

const Summary = (props: { store: IStore }) => {
  const classes = useStyles();
  const tfidfStore: IStore['tfidfStore'] = new TfidfStore(props.store, filters);
  const getDayColumn = (week: number) => {
    const days = times(daysInWeek).map((day) => addDays(start, day + week * daysInWeek));
    return days.map((day, index) => (
      <DayContent
        isFirst={index < 1}
        tfidfStore={tfidfStore}
        day={day}
        key={day.toISOString()}
        hoveredItem={undefined}
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

  return (
    <div className={classes.summary}>
      <div>{dayRows}</div>
    </div>
  );
};

export default Summary;
