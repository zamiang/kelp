import Drawer from '@material-ui/core/Drawer';
import Typography from '@material-ui/core/Typography';
import React, { useEffect, useState } from 'react';
import { IRouteProps } from '../dashboard';
import panelStyles from '../shared/panel-styles';
import ExpandedMeeting from './expand-meeting';
import Meeting, { CURRENT_TIME_ELEMENT_ID } from './meeting-row';

const MeetingsByDay = (
  props: IRouteProps & {
    setSelectedMeetingId: (id: string) => void;
    selectedMeetingId: string | null;
  },
) => {
  const meetingsByDay = props.timeDataStore.getSegmentsByDay();
  const currentTime = new Date();
  const styles = panelStyles();
  const days = Object.keys(meetingsByDay).sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1));
  let hasRenderedCurrentTime = false;
  return (
    <React.Fragment>
      {days.map((day) => (
        <div key={day} className={styles.row}>
          <Typography className={styles.title}>{day}</Typography>
          {meetingsByDay[day]
            .sort((a, b) => (a.start > b.start ? 1 : -1))
            .map((meeting) => {
              let shouldRenderCurrentTime = false;
              if (!hasRenderedCurrentTime && meeting.start > currentTime) {
                hasRenderedCurrentTime = true;
                shouldRenderCurrentTime = true;
              }
              return (
                <Meeting
                  currentTime={currentTime}
                  shouldRenderCurrentTime={shouldRenderCurrentTime}
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
              );
            })}
        </div>
      ))}
    </React.Fragment>
  );
};

const Meetings = (props: IRouteProps) => {
  const [selectedMeetingId, setSelectedMeetingId] = useState(props.routeId);
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

  // Scroll the 'current time' dot into view
  // TODO: This is weird and non-standard react. Ideally the meeting to scroll to on initial load would be declared in this function and passed down
  // HOWEVER I can't figure out how to have that only happen on render and not on every time selected meeting id changes
  if (!selectedMeetingId) {
    setTimeout(() => {
      const element = document.getElementById(CURRENT_TIME_ELEMENT_ID);
      element && element.scrollIntoView(true);
    }, 100);
  }
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
            timeStore={props.timeDataStore}
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
