import { Drawer, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import ExpandedMeeting from './expand-meeting';
import Meeting from './meeting';

const useStyles = makeStyles((theme) => ({
  day: {
    fontSize: theme.typography.body2.fontSize,
    textTransform: 'uppercase',
    marginBottom: theme.spacing(2),
    marginLeft: -theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
  },
  meetingRow: {
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
        <div key={day} className={classes.meetingRow}>
          <Typography className={classes.day}>{day}</Typography>
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
        </div>
      ))}
    </React.Fragment>
  );
};

const Meetings = (props: IRouteProps) => {
  const segments = props.timeDataStore.getSegments();
  const [selectedMeetingId, setSelectedMeetingId] = useState(
    props.routeId || (segments[0] ? segments[0].id : null),
  );
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
      <div className={styles.panel}>
        <MeetingsByDay
          selectedMeetingId={selectedMeetingId}
          setSelectedMeetingId={setSelectedMeetingId}
          {...props}
        />
      </div>
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
