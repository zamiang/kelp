import { Avatar, Drawer, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import ExpandedMeeting from './expand-meeting';
import Meeting from './meeting';

const useStyles = makeStyles((theme) => ({
  day: {
    color: theme.palette.getContrastText(theme.palette.secondary.main),
    backgroundColor: theme.palette.secondary.main,
    fontSize: theme.typography.body1.fontSize,
  },
  month: { textTransform: 'uppercase', paddingTop: 2, textAlign: 'center', display: 'block' },
  meetingRow: {
    borderTop: `1px solid ${theme.palette.primary.dark}`,
    marginBottom: theme.spacing(4),
  },
}));

const MeetingsByDay = (
  props: IRouteProps & {
    setSelectedMeetingId: (id: string) => void;
    selectedMeetingId: string | null;
  },
) => {
  const meetingsByDay = props.timeDataStore.getSegmentsByDay();
  const currentTime = new Date();
  const classes = useStyles();
  return (
    <React.Fragment>
      {Object.keys(meetingsByDay).map((day) => (
        <Grid container key={day} spacing={2} className={classes.meetingRow}>
          <Grid item>
            <Avatar className={classes.day}>{day.split('-')[0]}</Avatar>
            <Typography className={classes.month} variant="caption">
              {day.split('-')[1]}
            </Typography>
          </Grid>
          <Grid item style={{ flex: 1 }}>
            {meetingsByDay[day].map((meeting) => (
              <Meeting
                currentTime={currentTime}
                key={meeting.id}
                meeting={meeting}
                handlePersonClick={props.handlePersonClick}
                personStore={props.personDataStore}
                docStore={props.docDataStore}
                emailStore={props.emailStore}
                driveActivityStore={props.driveActivityStore}
                setSelectedMeetingId={props.setSelectedMeetingId}
                selectedMeetingId={props.selectedMeetingId}
              />
            ))}
          </Grid>
        </Grid>
      ))}
    </React.Fragment>
  );
};

const Meetings = (props: IRouteProps) => {
  const segments = props.timeDataStore.getSegments();
  const [selectedMeetingId, setSelectedMeetingId] = useState(segments[0] ? segments[0].id : null);
  const selectedMeeting = selectedMeetingId
    ? props.timeDataStore.getSegmentById(selectedMeetingId)
    : null;
  const [seconds, setSeconds] = useState(0);
  const styles = panelStyles();
  // rerender every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <React.Fragment>
      <Grid item xs={12} className={styles.panel}>
        <Grid container spacing={0}>
          <Grid item xs={5}>
            <MeetingsByDay
              selectedMeetingId={selectedMeetingId}
              setSelectedMeetingId={setSelectedMeetingId}
              {...props}
            />
          </Grid>
        </Grid>
      </Grid>
      <Drawer
        open={selectedMeetingId ? true : false}
        classes={{
          paper: styles.dockedPanel,
        }}
        anchor="right"
        variant="persistent"
      >
        {selectedMeeting && (
          <ExpandedMeeting
            meeting={selectedMeeting}
            handlePersonClick={props.handlePersonClick}
            personStore={props.personDataStore}
            docStore={props.docDataStore}
            emailStore={props.emailStore}
            driveActivityStore={props.driveActivityStore}
          />
        )}
      </Drawer>
    </React.Fragment>
  );
};

export default Meetings;
