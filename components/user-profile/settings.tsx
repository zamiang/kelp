import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import config from '../../constants/config';
import CloseIcon from '../../public/icons/close.svg';
import { GoogleLoginButton } from '../shared/google-login';
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
      void chrome.storage.sync.set({ [config.NOTIFICATIONS_KEY]: 'enabled' });
    } else {
      setNotificationsEnabled(false);
      void chrome.storage.sync.set({ [config.NOTIFICATIONS_KEY]: 'disabled' });
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
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Box flex="0 0 50%">
          <Typography variant="h1" style={{ marginBottom: 22 }}>
            Settings
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Box flex="0 0 50%">
          <Typography variant="h3">Google</Typography>
        </Box>
        <Box flex="0 0 50%">
          <GoogleLoginButton currentUser={currentUser} />
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Box flex="0 0 50%">
          <Typography variant="h3">Microsoft Teams</Typography>
        </Box>
        <Box flex="0 0 50%">
          <AuthenticatedTemplate>
            <WelcomeUser />
            <LogOutButton />
          </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <SignInButton />
          </UnauthenticatedTemplate>
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Box flex="0 0 50%">
          <Typography variant="h3">Upcoming Meeting Notifications</Typography>
        </Box>
        <Box flex="0 0 50%">
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
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Box flex="0 0 50%">
          <Typography variant="h3">Hidden websites</Typography>
        </Box>
        <Box flex="0 0 50%">
          {shouldShowEmptyWebsiteBlocklist && (
            <Typography>
              Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
            </Typography>
          )}
          {websiteBlocklist.map((item) => (
            <Box
              key={item.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              className={classes.grid}
              gap={2}
            >
              <Box flex="1">
                <Typography noWrap>{item.id}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => removeWebsite(item.id)} size="large">
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Divider />
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.section}
      >
        <Box flex="0 0 50%">
          <Typography variant="h3">Hidden domains</Typography>
          <Typography>All urls under these domains are hidden</Typography>
        </Box>
        <Box flex="0 0 50%">
          {shouldShowEmptyDomainBlocklist && (
            <Typography>
              Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
            </Typography>
          )}
          {domainBlocklists.map((item) => (
            <Box
              key={item.id}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              className={classes.grid}
              gap={2}
            >
              <Box flex="1">
                <Typography noWrap>{item.id}</Typography>
              </Box>
              <Box>
                <IconButton onClick={() => removeDomain(item.id)} size="large">
                  <CloseIcon width="18" height="18" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Root>
  );
};

export default Settings;
