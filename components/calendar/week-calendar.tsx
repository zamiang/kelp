import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from 'clsx';
import { addDays, differenceInMinutes, format, isSameDay, startOfWeek, subDays } from 'date-fns';
import { times } from 'lodash';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import config from '../../constants/config';
import { IFormattedDriveActivity } from '../fetch/fetch-drive-activity';
import { IDoc } from '../store/doc-store';
import { IEmail } from '../store/email-store';
import { IStore } from '../store/use-store';

const leftSpacer = 40;
const topNavHeight = 94;
const hourHeight = 48;
const scrollBarWidth = 15;
const borderColor = '#dadce0';
const shouldShowSentEmails = false;
const shouldShowDocumentActivity = true;
const shouldShowCalendarEvents = true;
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

const useDayTitleStyles = makeStyles((theme) => ({
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
  dayOfWeek: {
    display: 'inline-block',
  },
}));

const DayTitle = (props: { day: Date }) => {
  const isToday = isSameDay(props.day, new Date());
  const classes = useDayTitleStyles();
  return (
    <React.Fragment>
      <Typography className={classes.dayOfWeek} variant="h6">
        {format(props.day, 'EEE')}
      </Typography>
      <Typography className={clsx(classes.day, isToday && classes.currentDay)} variant="h6">
        {format(props.day, 'd')}
      </Typography>
    </React.Fragment>
  );
};

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
    fontWeight: theme.typography.fontWeightBold,
  },
  subtitle: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
  },
  documentBackground: {
    background: config.PINK_BACKGROUND,
  },
}));

interface ICalendarItemProps {
  onClick: () => void;
  title: string;
  start: Date;
  end?: Date;
}

const CalendarItem = (props: ICalendarItemProps) => {
  const classes = useCalendarItemStyles();
  const minuteHeight = hourHeight / 60;
  const height = props.end
    ? Math.abs(differenceInMinutes(props.start, props.end) * minuteHeight)
    : 100;
  const top = hourHeight * props.start.getHours();
  return (
    <div className={classes.container} style={{ height, top }} onClick={props.onClick}>
      <Typography className={classes.title} variant="h6">
        {props.title}
        <Typography className={classes.subtitle}>{format(props.start, 'HH:MM')}</Typography>
      </Typography>
    </div>
  );
};

interface IEmailItemProps {
  onClick: () => void;
  email: IEmail;
}

const EmailItem = (props: IEmailItemProps) => {
  const classes = useCalendarItemStyles();
  const top = hourHeight * props.email.date.getHours();
  return (
    <div className={classes.container} style={{ top }} onClick={props.onClick}>
      <Typography className={classes.title}>{props.email.subject}</Typography>
      <Typography className={classes.subtitle}>{props.email.to}</Typography>
    </div>
  );
};

interface IDocumentItemProps {
  document?: IDoc;
  activity?: IFormattedDriveActivity;
}

const DocumentItem = (props: IDocumentItemProps) => {
  const classes = useCalendarItemStyles();
  const router = useRouter();
  if (!props.activity || !props.document) {
    return null;
  }
  const onClick = () => props.document && router.push(`?tab=docs&slug=${props.document.id}`);
  const top = hourHeight * props.activity.time.getHours();
  return (
    <div
      className={clsx(classes.container, classes.containerRight, classes.documentBackground)}
      style={{ top }}
      onClick={onClick}
    >
      <Typography className={classes.title}>{props.document.name}</Typography>
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
  shouldShowSentEmails: boolean;
  shouldShowDocumentActivity: boolean;
  shouldShowCalendarEvents: boolean;
  personStore: IStore['personDataStore'];
  activityStore: IStore['driveActivityStore'];
  timeStore: IStore['timeDataStore'];
  emailStore: IStore['emailDataStore'];
  documentsStore: IStore['docDataStore'];
  day: Date;
}

const DayContent = (props: IDayContentProps) => {
  let emailsHtml = '' as any;
  let documentsHtml = '' as any;
  let segmentsHtml = '' as any;
  const router = useRouter();
  const currentUser = props.personStore.getSelf();

  if (props.shouldShowCalendarEvents) {
    const segments = props.timeStore.getSegmentsForDay(props.day);
    segmentsHtml = segments.map((segment) => (
      <CalendarItem
        key={segment.id}
        title={segment.summary || '(no title)'}
        start={segment.start}
        end={segment.end}
        onClick={() => router.push(`?tab=meetings&slug=${segment.id}`)}
      />
    ));
  }

  if (props.shouldShowSentEmails && currentUser && currentUser.emailAddress) {
    const emails = props.emailStore
      .getEmailsFrom([currentUser.emailAddress])
      .filter((email) => isSameDay(email.date, props.day));
    emailsHtml = emails.map((email) => (
      <EmailItem key={email.id} email={email} onClick={() => alert(`clicked ${email.id}`)} />
    ));
  }

  if (props.shouldShowDocumentActivity && currentUser) {
    const documentActivityPairs = Object.values(currentUser.driveActivity)
      .filter((activity) => activity && activity.link && isSameDay(activity.time, props.day))
      .map((activity) => ({
        activity,
        document: props.documentsStore.getByLink(activity.link!),
      }));

    documentsHtml = documentActivityPairs.map((pairs) => (
      <DocumentItem
        key={pairs.activity ? pairs.activity.id : 'key'}
        document={pairs.document}
        activity={pairs.activity}
      />
    ));
  }

  return (
    <div>
      {segmentsHtml}
      {emailsHtml}
      {documentsHtml}
    </div>
  );
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
  const [start, setStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }),
  );
  const onTodayClick = () => {
    setStart(startOfWeek(new Date(), { weekStartsOn: Number(config.WEEK_STARTS_ON) as any }));
  };
  const onForwardClick = () => {
    setStart(addDays(start, 7));
  };
  const onBackClick = () => {
    setStart(subDays(start, 7));
  };
  const dayColumn = times(7).map((day) => (
    <Grid item key={day} className={classes.dayColumn}>
      <HourRows />
      <DayContent
        shouldShowSentEmails={shouldShowSentEmails}
        shouldShowDocumentActivity={shouldShowDocumentActivity}
        shouldShowCalendarEvents={shouldShowCalendarEvents}
        personStore={props.personDataStore}
        activityStore={props.driveActivityStore}
        timeStore={props.timeDataStore}
        emailStore={props.emailDataStore}
        documentsStore={props.docDataStore}
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
