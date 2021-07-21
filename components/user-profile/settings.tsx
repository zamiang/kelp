import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { LogOutButton, SignInButton, WelcomeUser } from '../shared/microsoft-login';
import panelStyles from '../shared/panel-styles';
import { IDomainBlocklist, IWebsiteBlocklist } from '../store/data-types';
import { IStore } from '../store/use-store';

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
  maxWidth: {},
  grid: {
    maxWidth: theme.breakpoints.values.sm,
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 70,
    paddingTop: 9,
    '&:last-child': {
      borderBottom: '0px solid',
    },
  },
}));

const Settings = (props: { store: IStore }) => {
  const classes = panelStyles();
  const formClasses = useStyles();
  const [domainBlocklists, setDomainBlocklist] = useState<IDomainBlocklist[]>([]);
  const [websiteBlocklist, setWebsiteBlocklist] = useState<IWebsiteBlocklist[]>([]);

  const [isNotificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    localStorage.getItem(config.NOTIFICATIONS_KEY) !== 'disabled' ? true : false,
  );
  const notificationPermission = window['Notification'] ? Notification.permission : undefined;

  useEffect(() => {
    const fetch = async () => {
      const domainBlocklistArray = await props.store.domainBlocklistStore.getAll();
      const websiteBlocklistArray = await props.store.websiteBlocklistStore.getAll();
      setDomainBlocklist(domainBlocklistArray);
      setWebsiteBlocklist(websiteBlocklistArray);
    };
    void fetch();
  }, []);

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

  const shouldShowEmptyDomainBlocklist = domainBlocklists.length < 1;
  const shouldShowEmptyWebsiteBlocklist = websiteBlocklist.length < 1;

  const removeDomain = (domain: string) => {
    const fetch = async () => {
      await props.store.domainBlocklistStore.removeDomain(domain);
      const domainBlocklistArray = await props.store.domainBlocklistStore.getAll();
      setDomainBlocklist(domainBlocklistArray);
    };
    void fetch();
  };

  const removeWebsite = (domain: string) => {
    const fetch = async () => {
      await props.store.websiteBlocklistStore.removeWebsite(domain);
      const websiteBlocklistArray = await props.store.websiteBlocklistStore.getAll();
      setWebsiteBlocklist(websiteBlocklistArray);
    };
    void fetch();
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
        <div className={formClasses.textField} style={{ marginBottom: 22 }}>
          <Typography variant="h4" style={{ marginBottom: 24, marginTop: 55 }}>
            Sign in to Microsoft Teams
          </Typography>
          <AuthenticatedTemplate>
            <WelcomeUser />
            <LogOutButton />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <SignInButton />
          </UnauthenticatedTemplate>
        </div>
      </div>
      <Divider />
      <div className={classes.section}>
        <div className={formClasses.textField}>
          <Typography variant="h4" style={{ marginBottom: 0, marginTop: 55 }}>
            Hidden websites
          </Typography>
          {shouldShowEmptyWebsiteBlocklist && <Typography variant="h6">None</Typography>}
          {websiteBlocklist.map((item) => (
            <Grid
              key={item.id}
              container
              alignItems="center"
              justifyContent="space-between"
              className={formClasses.grid}
              spacing={2}
            >
              <Grid item xs={10}>
                <Typography noWrap>{item.id}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => removeWebsite(item.id)}>
                  <CloseIcon width="24" height="24" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </div>
      </div>
      <div className={classes.section}>
        <div className={formClasses.textField}>
          <Typography variant="h4" style={{ marginBottom: 0, marginTop: 55 }}>
            Hidden domains (all urls under these domains are hidden)
          </Typography>
          {shouldShowEmptyDomainBlocklist && <Typography variant="h6">None</Typography>}
          {domainBlocklists.map((item) => (
            <Grid
              key={item.id}
              container
              alignItems="center"
              justifyContent="space-between"
              className={formClasses.grid}
              spacing={2}
            >
              <Grid item xs={10}>
                <Typography noWrap>{item.id}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => removeDomain(item.id)}>
                  <CloseIcon width="24" height="24" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
