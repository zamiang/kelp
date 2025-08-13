import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import '../../styles/components/user-profile/settings.css';
import config from '../../../../constants/config';
import CloseIcon from '../../../../public/icons/close.svg';
import { GoogleLoginButton } from '../shared/google-login';
import { LogOutButton, SignInButton, WelcomeUser } from '../shared/microsoft-login';
import { IDomainBlocklist, IPerson, IWebsiteBlocklist } from '../store/data-types';
import { IStore } from '../store/use-store';

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
    <div className="settings-root">
      <div className="settings-panel">
        <div className="settings-section">
          <div className="settings-section-left">
            <Typography variant="h1" className="settings-title">
              Settings
            </Typography>
          </div>
        </div>

        <Divider className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-left">
            <Typography variant="h3" className="settings-section-title">
              Google
            </Typography>
          </div>
          <div className="settings-section-right">
            <GoogleLoginButton currentUser={currentUser} />
          </div>
        </div>

        <Divider className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-left">
            <Typography variant="h3" className="settings-section-title">
              Microsoft Teams
            </Typography>
          </div>
          <div className="settings-section-right">
            <div className="settings-auth-section">
              <AuthenticatedTemplate>
                <WelcomeUser />
                <LogOutButton />
              </AuthenticatedTemplate>
              <UnauthenticatedTemplate>
                <SignInButton />
              </UnauthenticatedTemplate>
            </div>
          </div>
        </div>

        <Divider className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-left">
            <Typography variant="h3" className="settings-section-title">
              Upcoming Meeting Notifications
            </Typography>
          </div>
          <div className="settings-section-right">
            <FormGroup className="settings-form-group">
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={isNotificationsEnabled}
                    onChange={() => toggleChecked(!isNotificationsEnabled)}
                  />
                }
                label="Meeting prep notifications"
                className="settings-form-label"
              />
            </FormGroup>
            <Typography className="settings-permission-status" variant="body2">
              Current browser permission status: {notificationPermission || 'not enabled'}
            </Typography>
          </div>
        </div>

        <Divider className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-left">
            <Typography variant="h3" className="settings-section-title">
              Hidden websites
            </Typography>
          </div>
          <div className="settings-section-right">
            {shouldShowEmptyWebsiteBlocklist && (
              <Typography className="settings-empty-state">
                Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
              </Typography>
            )}
            {websiteBlocklist.map((item) => (
              <div key={item.id} className="settings-grid-item">
                <div className="settings-grid-item-content">
                  <Typography className="settings-list-item-text">{item.id}</Typography>
                </div>
                <div className="settings-grid-item-actions">
                  <IconButton
                    onClick={() => removeWebsite(item.id)}
                    size="large"
                    className="settings-icon-button"
                  >
                    <CloseIcon width="18" height="18" className="settings-close-icon" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider className="settings-divider" />

        <div className="settings-section">
          <div className="settings-section-left">
            <Typography variant="h3" className="settings-section-title">
              Hidden domains
            </Typography>
            <Typography className="settings-description">
              All urls under these domains are hidden
            </Typography>
          </div>
          <div className="settings-section-right">
            {shouldShowEmptyDomainBlocklist && (
              <Typography className="settings-empty-state">
                Edit this list by hovering over a website and clicking the &lsquo;x&rsquo; icon
              </Typography>
            )}
            {domainBlocklists.map((item) => (
              <div key={item.id} className="settings-grid-item">
                <div className="settings-grid-item-content">
                  <Typography className="settings-list-item-text">{item.id}</Typography>
                </div>
                <div className="settings-grid-item-actions">
                  <IconButton
                    onClick={() => removeDomain(item.id)}
                    size="large"
                    className="settings-icon-button"
                  >
                    <CloseIcon width="18" height="18" className="settings-close-icon" />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
