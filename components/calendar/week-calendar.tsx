import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { addDays, format, startOfWeek } from 'date-fns';
import { times } from 'lodash';
import React from 'react';
import config from '../../constants/config';

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
    flexGrow: 1,
    textAlign: 'center',
    borderBottom: `1px solid ${borderColor}`,
  },
  spacer: {
    width: leftSpacer,
  },
}));

const TitleRow = () => {
  const classes = useTitleRowStyles();
  const start = startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any });
  return (
    <Grid container className={classes.container}>
      <Grid item className={classes.spacer}></Grid>
      <Grid item className={classes.item}>
        <DayTitle day={start} />
        <div className={classes.border}></div>
      </Grid>
      <Grid item className={classes.item}>
        <DayTitle day={addDays(start, 1)} />
        <div className={classes.border}></div>
      </Grid>
      <Grid item className={classes.item}>
        <DayTitle day={addDays(start, 2)} />
        <div className={classes.border}></div>
      </Grid>
      <Grid item className={classes.item}>
        <DayTitle day={addDays(start, 3)} />
        <div className={classes.border}></div>
      </Grid>
      <Grid item className={classes.item}>
        <DayTitle day={addDays(start, 4)} />
        <div className={classes.border}></div>
      </Grid>
      <Grid item className={classes.item}>
        <DayTitle day={addDays(start, 5)} />
        <div className={classes.border}></div>
      </Grid>
      <Grid item className={classes.item}>
        <DayTitle day={addDays(start, 6)} />
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
  },
  text: {
    background: '#fff', // Odd this is not white: theme.palette.background.default,
    paddingRight: 3,
    marginTop: -5,
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

const useStyles = makeStyles(() => ({
  container: {},
  calendar: {
    height: `calc(100vh - ${topNavHeight}px)`,
    overflow: 'scroll',
  },
  hourRow: {
    flex: 1,
  },
}));

const Calendar = () => {
  const classes = useStyles();
  const hourRows = times(7).map((day) => (
    <Grid item key={day} className={classes.hourRow}>
      <HourRows />
    </Grid>
  ));
  return (
    <div className={classes.container}>
      <TitleRow />
      <Grid container className={classes.calendar}>
        <Grid item>
          <HourLabels />
        </Grid>
        {hourRows}
      </Grid>
    </div>
  );
};

export default Calendar;
