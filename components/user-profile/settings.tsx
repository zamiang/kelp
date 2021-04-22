import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import config from '../../constants/config';
import panelStyles from '../shared/panel-styles';
import LogoutButton from '../user-profile/logout-button';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: 'auto',
  },
  maxWidth: {
    padding: theme.spacing(2),
  },
}));

const Settings = () => {
  const classes = panelStyles();
  const formClasses = useStyles();
  const [isNotificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    localStorage.getItem(config.NOTIFICATIONS_KEY) !== 'disabled' ? true : false,
  );
  const notificationPermission = window['Notification'] ? Notification.permission : undefined;

  const toggleChecked = (enabled: boolean) => {
    if (enabled) {
      setNotificationsEnabled(true);
      localStorage.setItem(config.NOTIFICATIONS_KEY, 'enabled');
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem(config.NOTIFICATIONS_KEY, 'disabled');
    }
    if ('Notification' in window) {
      return Notification.requestPermission();
    } else {
      alert('Notifications are not supported on this device');
    }
  };

  return (
    <div className={clsx(classes.panel, formClasses.maxWidth)}>
      <div className={classes.section}>
        <Typography variant="h3" color="textPrimary" style={{ marginBottom: 24 }}>
          Settings
        </Typography>
      </div>
      <Divider />
      <div className={classes.section}>
        <div className={formClasses.textField}>
          <Typography variant="h4" style={{ marginBottom: 24 }}>
            Upcoming Meeting Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={isNotificationsEnabled}
                  onChange={() => toggleChecked(!isNotificationsEnabled)}
                />
              }
              label="Meeting prep notifications"
            />
          </FormGroup>
          <Typography style={{ marginBottom: 22 }} variant="body2">
            Current browser permission status: {notificationPermission || 'not enabled'}
          </Typography>
        </div>
      </div>
      <Divider />
      <div className={classes.section}>
        <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
          <LogoutButton />
        </FormControl>
      </div>
    </div>
  );
};

export default Settings;
