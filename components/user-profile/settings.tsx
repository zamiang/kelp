import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import MoonIconOrange from '../../public/icons/moon-orange.svg';
import MoonIcon from '../../public/icons/moon.svg';
import DayIconOrange from '../../public/icons/sun-orange.svg';
import DayIconWhite from '../../public/icons/sun-white.svg';
import { LogOutButton, SignInButton, WelcomeUser } from '../shared/microsoft-login';
import { IDomainBlocklist, IPerson, IWebsiteBlocklist } from '../store/data-types';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  grid: {
    maxWidth: theme.breakpoints.values.sm,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingTop: theme.spacing(2),
    '&:last-child': {
      borderBottom: '0px solid',
    },
  },
  section: { paddingBottom: theme.spacing(4), paddingTop: theme.spacing(4) },
  panel: {},
}));

const Settings = (props: {
  store: IStore;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
}) => {
  const classes = useStyles();
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
    <div className={classes.panel}>
      <Grid
        container
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Grid item xs={6}>
          <Typography variant="h1" color="textPrimary" style={{ marginBottom: 22 }}>
            Settings
          </Typography>
          <Typography style={{ marginBottom: 22 }}>
            Signed in as: {currentUser?.emailAddresses[0]}
          </Typography>
          <Typography variant="body2">
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
          <Typography variant="h4">Dark mode</Typography>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title="Light Mode">
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={(event) => {
                event.preventDefault();
                props.setIsDarkMode(false);
                localStorage.setItem(config.DARK_MODE, String(false));
              }}
            >
              {props.isDarkMode ? (
                <DayIconWhite width="18" height="18" />
              ) : (
                <DayIconOrange width="18" height="18" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Dark Mode">
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={(event) => {
                event.preventDefault();
                props.setIsDarkMode(true);
                localStorage.setItem(config.DARK_MODE, String(true));
              }}
            >
              {props.isDarkMode ? (
                <MoonIconOrange width="18" height="18" />
              ) : (
                <MoonIcon width="18" height="18" />
              )}
            </IconButton>
          </Tooltip>
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
          <Typography variant="h4">Upcoming Meeting Notifications</Typography>
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
          <Typography variant="h4">Microsoft Teams</Typography>
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
          <Typography variant="h4">Hidden websites</Typography>
        </Grid>
        <Grid item xs={6}>
          {shouldShowEmptyWebsiteBlocklist && (
            <Typography variant="h6">
              Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
            </Typography>
          )}
          {websiteBlocklist.map((item) => (
            <Grid
              key={item.id}
              container
              alignItems="flex-start"
              justifyContent="space-between"
              className={classes.grid}
              spacing={2}
            >
              <Grid item xs={10}>
                <Typography noWrap>{item.id}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => removeWebsite(item.id)}>
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
          <Typography variant="h4">Hidden domains</Typography>
          <Typography variant="h6">All urls under these domains are hidden</Typography>
        </Grid>
        <Grid item xs={6}>
          {shouldShowEmptyDomainBlocklist && (
            <Typography variant="h6">
              Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
            </Typography>
          )}
          {domainBlocklists.map((item) => (
            <Grid
              key={item.id}
              container
              alignItems="flex-start"
              justifyContent="space-between"
              className={classes.grid}
              spacing={2}
            >
              <Grid item xs={10}>
                <Typography noWrap>{item.id}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={() => removeDomain(item.id)}>
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings;
