import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { addDays } from 'date-fns';
import { times } from 'lodash';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { DayContent } from '../dashboard/summary';
import Tfidf from '../shared/tfidf';
import { IStore } from '../store/use-store';

const daysInWeek = 3;
const numberWeeks = 1;
const setHoveredItem = () => null;
const start = new Date();

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
  const [tfidf, setTfidf] = useState<Tfidf | undefined>(undefined);

  useEffect(() => {
    const compute = async () => {
      const instance = await props.store.tfidfStore.getTfidf();
      setTfidf(instance);
    };
    void compute();
  }, []);

  if (!tfidf) {
    return null;
  }

  const getDayColumn = (week: number) => {
    const days = times(daysInWeek).map((day) => addDays(start, day + week * daysInWeek));
    return days.map((day, index) => (
      <DayContent
        isFirst={index < 1}
        tfidf={tfidf}
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
    <Router>
      <div className={classes.summary}>
        <div>{dayRows}</div>
      </div>
    </Router>
  );
};

export default Summary;
