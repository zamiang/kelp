import Typography from '@material-ui/core/Typography';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Meeting from '../../components/calendar/meeting-row';
import panelStyles from '../../components/shared/panel-styles';
import { IStore } from '../../components/store/use-store';

const MeetingsByDay = (
  props: IStore & {
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
                  personStore={props.personDataStore}
                  docStore={props.docDataStore}
                  emailStore={props.emailDataStore}
                  driveActivityStore={props.driveActivityStore}
                  selectedMeetingId={props.selectedMeetingId}
                />
              );
            })}
        </div>
      ))}
    </React.Fragment>
  );
};

const Meetings = (props: IStore) => {
  const selectedMeetingId = useRouter().query.slug as string;
  const [seconds, setSeconds] = useState(0);
  // rerender every 5 seconds to update the current calendar events
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);

  /**
  // Scroll the 'current time' dot into view
  // TODO: This is weird and non-standard react. Ideally the meeting to scroll to on initial load would be declared in this function and passed down
  // HOWEVER I can't figure out how to have that only happen on render and not on every time selected meeting id changes
  if (!selectedMeetingId) {
    setTimeout(() => {
      const element = document.getElementById(CURRENT_TIME_ELEMENT_ID);
      element && element.scrollIntoView(true);
    }, 100);
  }
   */
  return <MeetingsByDay selectedMeetingId={selectedMeetingId} {...props} />;
};

export default Meetings;
