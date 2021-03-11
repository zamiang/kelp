import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import config from '../../constants/config';
import panelStyles from '../shared/panel-styles';
import TopBar from '../shared/top-bar';
import LogoutButton from '../user-profile/logout-button';

const shouldRenderSettings = false;

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: '100%',
  },
  maxWidth: {
    maxWidth: 500,
  },
}));

const Settings = (props: { shouldRenderHeader: boolean }) => {
  const classes = panelStyles();
  const formClasses = useStyles();
  const notificationPermission = window['Notification'] ? Notification.permission : undefined;
  return (
    <div className={props.shouldRenderHeader ? classes.panel : undefined}>
      {props.shouldRenderHeader && <TopBar title="Settings"></TopBar>}
      <div className={classes.section}>
        {shouldRenderSettings && (
          <React.Fragment>
            <div className={clsx(classes.section, formClasses.maxWidth)}>
              <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
                <InputLabel htmlFor="days-back">Number of days to look back</InputLabel>
                <Input id="days-back" type={'text'} value={config.NUMBER_OF_DAYS_BACK} />
              </FormControl>
              <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
                <InputLabel htmlFor="week-starts-on">Week starts on</InputLabel>
                <Input id="week-starts-on" type={'text'} value={config.WEEK_STARTS_ON} />
              </FormControl>
              <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
                <InputLabel htmlFor="week-starts-on">
                  Max meeting attendees to count as interactions in Contact Associates
                </InputLabel>
                <Input
                  id="max-meeting-attendees"
                  type={'text'}
                  value={config.MAX_MEETING_ATTENDEE_TO_COUNT_AN_INTERACTION}
                />
              </FormControl>
            </div>
            <div className={clsx(classes.section, formClasses.maxWidth)}>
              <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
                <Button variant="contained" color="primary" disableElevation>
                  Save
                </Button>
              </FormControl>
            </div>
          </React.Fragment>
        )}
        <div className={clsx(classes.section, formClasses.maxWidth)}>
          <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
            <InputLabel htmlFor="notifications">Notifications</InputLabel>
            <br />
            <br />
            <br />
            <Button
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                if (window['Notification']) {
                  return Notification.requestPermission();
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
    </div>
  );
};

export default Settings;
