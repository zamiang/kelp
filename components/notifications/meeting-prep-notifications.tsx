import Dialog from '@material-ui/core/Dialog';
import { differenceInMilliseconds } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ExpandedMeeting from '../meeting/expand-meeting';
import { ISegment } from '../store/models/segment-model';
import { IStore } from '../store/use-store';

const createNotification = (meeting: ISegment, onClick: () => void, onClose: () => void) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const title = `Prepare for: ${meeting.summary || 'Meeting notification'}`;
    const notification = new Notification(title, {
      icon: `${window.location.protocol}//${window.location.host}/android-chrome-192x192.png`,
      badge: `${window.location.protocol}//${window.location.host}/favicon-32x32.png`,
      tag: 'meeting-prep',
    });
    notification.onclick = () => {
      window.focus();
      return onClick();
    };
    notification.onclose = onClose;
    const timeout = differenceInMilliseconds(meeting.end, new Date());
    setTimeout(() => {
      notification.close();
    }, timeout);
  }
};

const MeetingPrepNotifications = (props: IStore) => {
  const router = useHistory();
  const [currentMeeting, setCurrentMeeting] = useState<ISegment | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(
    currentMeeting ? Notification.permission === 'denied' : false,
  );
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const updateCurrentMeeting = async () => {
        const newMeeting = await props.timeDataStore.getCurrentSegment();
        if (newMeeting && newMeeting.id !== currentMeeting?.id) {
          createNotification(
            newMeeting,
            () => router.push(`/meetings?slug=${newMeeting.id}`),
            () => setIsOpen(false),
          );
          setCurrentMeeting(newMeeting);
        }
      };
      void updateCurrentMeeting();
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <Dialog open={isOpen}>
      {currentMeeting && (
        <ExpandedMeeting
          close={() => setIsOpen(false)}
          meetingId={currentMeeting.id}
          store={props}
        />
      )}
    </Dialog>
  );
};

export default MeetingPrepNotifications;
