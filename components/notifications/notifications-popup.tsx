import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import useButtonStyles from '../shared/button-styles';
import useExpandStyles from '../shared/expand-styles';

const checkNotificationPromise = async () => {
  try {
    if ('Notification' in window) {
      return await Notification.requestPermission().then();
    }
    return false;
  } catch (e) {
    return false;
  }
};

const askNotificationPermission = async () => {
  // function to actually ask the permissions
  const handlePermission = (permission: NotificationPermission) => {
    // Whatever the user answers, we make sure Chrome stores the information
    if (!('permission' in Notification)) {
      (Notification as any).permission = permission;
    }
  };

  // Let's check if the browser supports notifications
  if (!('Notification' in window)) {
    // console.log('This browser does not support notifications.');
  } else {
    if (await checkNotificationPromise()) {
      await Notification.requestPermission().then((permission) => {
        handlePermission(permission);
      });
    } else {
      await Notification.requestPermission(function (permission) {
        handlePermission(permission);
      });
    }
  }
};

const NotificationsPopup = () => {
  const [isOpen, setIsOpen] = useState<boolean>(
    'Notification' in window && Notification.permission === 'default',
  );
  const classes = useExpandStyles();
  const buttonClasses = useButtonStyles();

  return (
    <Dialog open={isOpen}>
      <div className={classes.topContainer}>
        <Typography className={classes.title} variant="h5">
          Thanks for signing up for Kelp!
        </Typography>
        <Typography>
          Kelp can send you meeting prep notifications. The notifications will only send if Kelp is
          open.
        </Typography>
      </div>
      <div className={classes.container}>
        <Button className={buttonClasses.selected} onClick={askNotificationPermission}>
          Enable Notifications
        </Button>
        <Button onClick={() => setIsOpen(false)}>Close</Button>
      </div>
    </Dialog>
  );
};

export default NotificationsPopup;
