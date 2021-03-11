import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import clsx from 'clsx';
import { addDays, format, getDate, isPast, isSameDay, isToday, subDays } from 'date-fns';
import React from 'react';
import { mediumFontFamily } from '../../constants/theme';
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
    color: 'rgba(0,0,0,0.5)',
  },
  dayNumber: {
    display: 'block',
    fontSize: 16,
  },
  daySelected: {
    color: theme.palette.primary.main,
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    margin: '0px auto',
    marginTop: 2,
    transition: 'background 0.3s',
  },

  dayDotSelected: {
    background: theme.palette.primary.main,
  },
  container: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
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
      background: theme.palette.secondary.light,
    },
  },
  topPadding: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  topHeading: {
    textTransform: 'uppercase',
    fontWeight: 500,
    fontFamily: mediumFontFamily,
    display: 'inline-block',
    marginTop: 2,
  },
  bottomPadding: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    margin: '0px auto',
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
    addDays(props.currentDay, 5),
    addDays(props.currentDay, 6),
  ];

  return (
    <div className={classes.container}>
      <div className={classes.topPadding}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Typography className={classes.topHeading}>{format(new Date(), 'MMM yyyy')}</Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              className={clsx(buttonClasses.button, buttonClasses.buttonPrimary)}
              onClick={props.onNowClick}
              style={{ fontSize: 14, paddingTop: 5, paddingBottom: 5 }}
            >
              Today
            </Button>
          </Grid>
        </Grid>
      </div>
      <div className={classes.bottomPadding}>
        <Grid container spacing={1} alignItems="center" justify="space-between">
          <Grid item>
            <IconButton size="small">
              <KeyboardArrowLeftIcon />
            </IconButton>
          </Grid>
          {days.map((d) => (
            <Grid item key={getDate(d)} className={classes.day} onClick={() => props.onDayClick(d)}>
              <Grid container alignItems="center">
                <Grid item xs={12}>
                  <Typography className={clsx(classes.dayName)}>{format(d, 'EEE')}</Typography>
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
            <IconButton size="small">
              <KeyboardArrowRightIcon />
            </IconButton>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default MeetingTopBar;
