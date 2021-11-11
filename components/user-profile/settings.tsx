import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { LogOutButton, SignInButton, WelcomeUser } from '../shared/microsoft-login';
import { IDomainBlocklist, IPerson, IWebsiteBlocklist } from '../store/data-types';
import { IStore } from '../store/use-store';

const PREFIX = 'Settings';

const classes = {
  margin: `${PREFIX}-margin`,
  grid: `${PREFIX}-grid`,
  section: `${PREFIX}-section`,
  panel: `${PREFIX}-panel`,
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.margin}`]: {
    margin: theme.spacing(1),
  },
  [`& .${classes.grid}`]: {
    maxWidth: theme.breakpoints.values.sm,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '&:last-child': {
      borderBottom: '0px solid',
    },
  },
  [`& .${classes.section}`]: { paddingBottom: theme.spacing(4), paddingTop: theme.spacing(4) },
  [`&.${classes.panel}`]: {},
}));

const Settings = (props: { store: IStore }) => {
  const [domainBlocklists, setDomainBlocklist] = useState<IDomainBlocklist[]>([]);
  const [websiteBlocklist, setWebsiteBlocklist] = useState<IWebsiteBlocklist[]>([]);
  const [currentUser, setCurrentUser] = useState<IPerson>();

  const [isNotificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    localStorage.getItem(config.NOTIFICATIONS_KEY) !== 'disabled' ? true : false,
  );
  const notificationPermission = window['Notification'] ? Notification.permission : undefined;

  useEffect(() => {
    const fetch = async () => {
      const cu = await props.store.personDataStore.getSelf();
      setCurrentUser(cu);
    };
    void fetch();
  }, [props.store.isLoading]);

  useEffect(() => {
    const fetch = async () => {
      const domainBlocklistArray = await props.store.domainBlocklistStore.getAll();
      const websiteBlocklistArray = await props.store.websiteBlocklistStore.getAll();
      setDomainBlocklist(domainBlocklistArray);
      setWebsiteBlocklist(websiteBlocklistArray);
    };
    void fetch();
  }, [props.store.isLoading]);

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
    <Root className={classes.panel}>
      <Grid
        container
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Grid item xs={6}>
          <Typography variant="h1" style={{ marginBottom: 22 }}>
            Settings
          </Typography>
          <Typography style={{ marginBottom: 22 }}>
            Signed in as: {currentUser?.emailAddresses[0]}
          </Typography>
          <Typography>
            Note: If you sign into multiple Google Accounts (like for personal life and work), we
            recommend using{' '}
            <Link href="https://support.google.com/chrome/answer/2364824">
              Google Chrome Profiles
            </Link>
            .
          </Typography>
        </Grid>
      </Grid>
      <Divider />
      <Grid
        container
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Grid item xs={6}>
          <Typography variant="h3">Upcoming Meeting Notifications</Typography>
        </Grid>
        <Grid item xs={6}>
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
        </Grid>
      </Grid>
      <Divider />
      <Grid
        container
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Grid item xs={6}>
          <Typography variant="h3">Microsoft Teams</Typography>
        </Grid>
        <Grid item xs={6}>
          <AuthenticatedTemplate>
            <WelcomeUser />
            <LogOutButton />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <SignInButton />
          </UnauthenticatedTemplate>
        </Grid>
      </Grid>
      <Divider />
      <Grid
        container
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Grid item xs={6}>
          <Typography variant="h3">Hidden websites</Typography>
        </Grid>
        <Grid item xs={6}>
          {shouldShowEmptyWebsiteBlocklist && (
            <Typography>
              Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
            </Typography>
          )}
          {websiteBlocklist.map((item) => (
            <Grid
              key={item.id}
              container
              alignItems="center"
              justifyContent="space-between"
              className={classes.grid}
              spacing={2}
            >
              <Grid item xs={10}>
                <Typography noWrap>{item.id}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => removeWebsite(item.id)} size="large">
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Divider />
      <Grid
        container
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Grid item xs={6}>
          <Typography variant="h3">Hidden domains</Typography>
          <Typography>All urls under these domains are hidden</Typography>
        </Grid>
        <Grid item xs={6}>
          {shouldShowEmptyDomainBlocklist && (
            <Typography>
              Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
            </Typography>
          )}
          {domainBlocklists.map((item) => (
            <Grid
              key={item.id}
              container
              alignItems="center"
              justifyContent="space-between"
              className={classes.grid}
              spacing={2}
            >
              <Grid item xs={10}>
                <Typography noWrap>{item.id}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => removeDomain(item.id)} size="large">
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Root>
  );
};

export default Settings;
