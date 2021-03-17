import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import config from '../../constants/config';
import useButtonStyles from '../shared/button-styles';
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
    maxWidth: 500,
    padding: theme.spacing(2),
  },
}));

const Settings = () => {
  const classes = panelStyles();
  const formClasses = useStyles();
  const buttonClasses = useButtonStyles();
  const notificationPermission = window['Notification'] ? Notification.permission : undefined;

  const isNotificationsDisabled = localStorage.getItem(config.kelpNotificationsKey) === 'true';

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
            Notifications
          </Typography>
          {!isNotificationsDisabled && (
            <Button
              className={buttonClasses.button}
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                localStorage.setItem(config.kelpNotificationsKey, 'true');
                if (window['Notification']) {
                  return Notification.requestPermission();
                } else {
                  alert('Notifications are not supported on this device');
                }
              }}
            >
              Disable meeting prep notifications
            </Button>
          )}
          {isNotificationsDisabled && (
            <Button
              className={buttonClasses.button}
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                localStorage.setItem(config.kelpNotificationsKey, 'false');
                if (window['Notification']) {
                  return Notification.requestPermission();
                } else {
                  alert('Notifications are not supported on this device');
                }
              }}
            >
              Enable meeting prep notifications
            </Button>
          )}
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
