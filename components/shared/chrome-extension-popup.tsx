import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import useButtonStyles from './button-styles';
import useExpandStyles from './expand-styles';

const ChromeExtensionPopup = () => {
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
          Kelp can send you meeting prep notifications by using the chrome extension
        </Typography>
      </div>
      <div className={classes.container}>
        <Button
          className={buttonClasses.selected}
          href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl?hl=en&authuser=0"
        >
          Install the Chrome Extnesion
        </Button>
        <Button onClick={() => setIsOpen(false)}>Close</Button>
      </div>
    </Dialog>
  );
};

export default ChromeExtensionPopup;
