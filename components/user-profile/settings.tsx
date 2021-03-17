import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
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
  return (
    <div className={classes.panel}>
      <div className={clsx(classes.section, formClasses.maxWidth)}>
        <Typography variant="h3" color="textPrimary">
          Settings
        </Typography>
      </div>
      <div className={clsx(classes.section, formClasses.maxWidth)}>
        <FormControl className={formClasses.textField}>
          <InputLabel htmlFor="days-back">Number of days to look back</InputLabel>
          <Input id="days-back" type={'text'} value={config.NUMBER_OF_DAYS_BACK} />
        </FormControl>
      </div>
      <div className={clsx(classes.section, formClasses.maxWidth)}>
        <FormControl className={formClasses.textField}>
          <Button
            variant="contained"
            color="primary"
            className={buttonClasses.button}
            disableElevation
          >
            Save
          </Button>
        </FormControl>
      </div>
      <div className={clsx(classes.section, formClasses.maxWidth)}>
        <FormControl className={formClasses.textField}>
          <InputLabel htmlFor="notifications">
            <Typography variant="h3">Notifications</Typography>
          </InputLabel>
          <Button
            className={buttonClasses.button}
            variant="contained"
            color="primary"
            disableElevation
            onClick={() => {
              if (window['Notification']) {
                return Notification.requestPermission();
              } else {
                alert('Notifications are not supported on this device');
              }
            }}
          >
            Enable meeting prep notifications
          </Button>
          Current status: {notificationPermission || 'not enabled'}
        </FormControl>
      </div>
      <div className={clsx(classes.section, formClasses.maxWidth)}>
        <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
          <LogoutButton />
        </FormControl>
      </div>
    </div>
  );
};

export default Settings;
