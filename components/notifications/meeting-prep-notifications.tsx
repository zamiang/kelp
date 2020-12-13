import Dialog from '@material-ui/core/Dialog';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import ExpandedMeeting from '../meeting/expand-meeting';
import { ISegment } from '../store/time-store';
import { IStore } from '../store/use-store';

const createNotification = (
  meeting: ISegment,
  onClick: () => Promise<boolean>,
  onClose: () => void,
) => {
  if (window.Notification && Notification.permission === 'granted') {
    const title = `Prepare for: ${meeting.summary || 'Meeting notification'}`;
    const notification = new Notification(title, {
      tag: 'meeting-prep',
      icon: 'https://www.kelp.nyc/kelp.svg',
    });
    notification.onclick = onClick;
    notification.onclose = onClose;
  }
};

const MeetingPrepNotifications = (props: IStore) => {
  const router = useRouter();
  const [currentMeeting, setCurrentMeeting] = useState(props.timeDataStore.getCurrentSegment());
  const [isOpen, setIsOpen] = useState<boolean>(
    currentMeeting ? Notification.permission === 'denied' : false,
  );
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newMeeting = props.timeDataStore.getCurrentSegment();
      if (newMeeting !== currentMeeting && newMeeting) {
        createNotification(
          newMeeting,
          () => router.push(`?tab=meetings&slug=${newMeeting.id}`),
          () => setIsOpen(false),
        );
        setCurrentMeeting(newMeeting);
      }
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <Dialog open={isOpen}>
      {currentMeeting && (
        <ExpandedMeeting close={() => setIsOpen(false)} meetingId={currentMeeting.id} {...props} />
      )}
    </Dialog>
  );
};

export default MeetingPrepNotifications;
