import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
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
    maxWidth: 500,
    padding: theme.spacing(2),
  },
}));

const Settings = () => {
  const classes = panelStyles();
  const formClasses = useStyles();
  const [isNotificationsDisabled, setNotificationsDisabled] = useState<'on' | 'off'>(
    localStorage.getItem(config.kelpNotificationsKey) === 'true' ? 'on' : 'off',
  );
  const notificationPermission = window['Notification'] ? Notification.permission : undefined;

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
          <ToggleButtonGroup
            size="small"
            value={isNotificationsDisabled}
            exclusive
            onChange={(_event, value: string) => {
              if (value === 'on') {
                setNotificationsDisabled('on');
                localStorage.setItem(config.kelpNotificationsKey, 'true');
              } else {
                setNotificationsDisabled('off');
                localStorage.setItem(config.kelpNotificationsKey, 'false');
              }
              if ('Notification' in window) {
                return Notification.requestPermission();
              } else {
                alert('Notifications are not supported on this device');
              }
            }}
          >
            <ToggleButton value="on">On</ToggleButton>
            <ToggleButton value="off">Off</ToggleButton>
          </ToggleButtonGroup>
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
