import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import ArrowRight from '@material-ui/icons/ArrowRight';
import clsx from 'clsx';
import { addDays, format, getDate, isPast, isSameDay, isToday, subDays } from 'date-fns';
import React from 'react';
import useButtonStyles from '../shared/button-styles';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  past: {
    color: theme.palette.text.hint,
  },
  dayName: {
    textTransform: 'uppercase',
    fontSize: 9,
    display: 'block',
  },
  dayNumber: {
    fontSize: 16,
    display: 'block',
  },
  daySelected: {
    color: theme.palette.primary.main,
  },
  dayDot: {
    width: 3,
    height: 3,
    margin: '0px auto',
    transition: 'background 0.3s',
  },

  dayDotSelected: {
    background: theme.palette.primary.main,
  },
  container: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    position: 'sticky',
    top: 0,
    left: 0,
    background: theme.palette.background.paper,
    zIndex: 10,
  },
  day: {
    cursor: 'pointer',
    background: theme.palette.background.paper,
    transition: 'background 0.3s',
    textAlign: 'center',
    width: 32,
    '&:hover': {
      background: theme.palette.primary.light,
    },
  },
}));

const MeetingTopBar = (props: {
  store: IStore;
  onDayClick: (d: Date) => void;
  onNowClick: () => void;
  selectedDay: Date;
  currentDay: Date;
}) => {
  const buttonClasses = useButtonStyles();
  const classes = useStyles();
  const days: Date[] = [
    subDays(props.currentDay, 1),
    props.currentDay,
    addDays(props.currentDay, 1),
    addDays(props.currentDay, 2),
    addDays(props.currentDay, 3),
    addDays(props.currentDay, 4),
  ];

  return (
    <Grid container className={classes.container} spacing={1} alignItems="center">
      <Grid item>
        <IconButton>
          <ArrowLeft />
        </IconButton>
      </Grid>
      {days.map((d) => (
        <Grid item key={getDate(d)} className={classes.day} onClick={() => props.onDayClick(d)}>
          <Grid container alignItems="center">
            <Grid item xs={12}>
              <Typography
                className={clsx(
                  classes.dayName,
                  isToday(d) && classes.daySelected,
                  !isToday(d) && isPast(d) && classes.past,
                )}
              >
                {format(d, 'EEE')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                className={clsx(
                  classes.dayNumber,
                  isToday(d) && classes.daySelected,
                  !isToday(d) && isPast(d) && classes.past,
                )}
              >
                {getDate(d)}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <div
                className={clsx(
                  classes.dayDot,
                  isSameDay(d, props.selectedDay) && classes.dayDotSelected,
                )}
              ></div>
            </Grid>
          </Grid>
        </Grid>
      ))}
      <Grid item>
        <IconButton>
          <ArrowRight />
        </IconButton>
      </Grid>
      <Grid item>
        <Button
          variant="outlined"
          className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
          size="small"
          onClick={props.onNowClick}
        >
          Today
        </Button>
      </Grid>
    </Grid>
  );
};

export default MeetingTopBar;
