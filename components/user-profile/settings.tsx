import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { signIn } from 'next-auth/client';
import React from 'react';
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
    width: '100%',
  },
}));

const Settings = () => {
  const styles = panelStyles();
  const formClasses = useStyles();
  return (
    <React.Fragment>
      <div className={styles.row}>
        <Typography className={styles.title}>Settings</Typography>
      </div>
      <div className={styles.row}>
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
        <Button
          variant="contained"
          color="primary"
          disableElevation
          onClick={() => signIn('slack', { callbackUrl: config.REDIRECT_URI })}
        >
          Add Slack
        </Button>

        <div className={styles.row}>
          <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
            <Button variant="contained" color="primary" disableElevation>
              Save
            </Button>
          </FormControl>
        </div>
        <div className={styles.row}>
          <FormControl className={clsx(formClasses.margin, formClasses.textField)}>
            <LogoutButton />
          </FormControl>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Settings;
