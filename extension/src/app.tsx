import {
  AuthenticationResult,
  EventMessage,
  EventType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import { StyledEngineProvider } from '@mui/material/styles';
import ThemeProvider from '@mui/styles/ThemeProvider';
import { subMinutes } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';
import './styles/index.css';
import { MemoryRouter as Router, useLocation } from 'react-router-dom';
import { type ThemeName, initializeTheme, switchTheme } from './styles/theme-switcher';
import { createMaterialUIThemeConfig } from './styles/theme-bridge';
import { createTheme } from '@mui/material/styles';
import { DesktopDashboard } from '../../components/dashboard/desktop-dashboard';
import { msalConfig } from '../../components/fetch/microsoft/auth-config';
import { getGoogleClientID, launchGoogleAuthFlow } from '../../components/shared/google-login';
import db from '../../components/store/db';
import getStore from '../../components/store/use-store';
import config from '../../constants/config';
import { coolTheme, darkTheme, lightTheme, nbTheme } from '../../constants/theme';

const msalInstance = new PublicClientApplication(msalConfig);

const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const updateThrottleMinutes = 10;

const getShouldFetch = (): boolean => {
  if ((window as any).SHOULD_FETCH) {
    return (window as any).SHOULD_FETCH === 'true';
  }
  const lastUpdated = localStorage.getItem(config.LAST_UPDATED);
  const lastUpdatedDate = lastUpdated ? new Date(lastUpdated) : undefined;
  (window as any).SHOULD_FETCH =
    !lastUpdatedDate || lastUpdatedDate < subMinutes(new Date(), updateThrottleMinutes)
      ? 'true'
      : 'false';
  return (window as any).SHOULD_FETCH === 'true';
};

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

const scopes = config.GOOGLE_SCOPES.join(' ');

const LoadingMobileDashboardContainer = (props: {
  database: any;
  accessToken?: string;
  scope: string;
  setTheme: (theme: string) => void;
  theme: string;
  isMicrosoftError: boolean;
  isMicrosoftLoading: boolean;
}) => {
  const { instance } = useMsal();
  const currentAccount = instance.getActiveAccount();
  const store = getStore(
    getShouldFetch(),
    props.database,
    props.scope,
    props.accessToken,
    currentAccount || undefined,
    instance,
    props.isMicrosoftError || props.isMicrosoftLoading,
  );
  return (
    <div>
      {!store && (
        <Alert severity="error">
          <AlertTitle>Authentication Error</AlertTitle>
          <Typography style={{ width: 315 }}>
            Unable to connect to the database. Please restart your browser This is an issue I do not
            fully understand where the database does not accept connections. If you are familar with
            connection issues with indexdb, please email brennan@kelp.nyc.
          </Typography>
        </Alert>
      )}
      {store && (
        <Router initialEntries={['/home', '/meetings', '/settings']} initialIndex={0}>
          <ScrollToTop />
          <DesktopDashboard
            store={store}
            setTheme={props.setTheme}
            theme={props.theme}
            isMicrosoftError={props.isMicrosoftError}
          />
        </Router>
      )}
    </div>
  );
};

const MainContent = (props: { theme: string; setTheme: (t: string) => void }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isDoneFetchingToken, setDoneFetchingToken] = useState(false);
  const [hasAuthError, setHasAuthError] = useState(false);
  const [hasGoogleAdvancedProtectionError, setHasGoogleAdvancedProtectionError] =
    useState<boolean>(false);
  const [hasDatabaseError, setHasDatabaseError] = useState(false);
  const [database, setDatabase] = useState<any>(undefined);
  const [isMicrosoftError, setMicrosoftError] = useState(false);
  const [isMicrosoftLoading, setMicrosoftLoading] = useState(false);

  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.ACQUIRE_TOKEN_START) {
      setMicrosoftLoading(true);
    }
    if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
      setMicrosoftError(false);
      setMicrosoftLoading(false);
    }
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance.setActiveAccount(account);
      setMicrosoftError(false);
      setMicrosoftLoading(false);
    } else if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
      setMicrosoftError(true);
    }
  });

  useEffect(() => {
    if (chrome.identity.getAuthToken) {
      chrome.identity.getAuthToken({ interactive: true }, (result) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          if (
            chrome.runtime.lastError.message?.includes('Service has been disabled for this account')
          ) {
            setHasGoogleAdvancedProtectionError(true);
          } else {
            setHasAuthError(true);
          }
        } else if (result) {
          const token = typeof result === 'string' ? result : result.token;
          setToken(token);
        } else {
          console.error('no token sad times');
          if (localStorage.getItem(config.GOOGLE_ENABLED)) {
            launchGoogleAuthFlow(true, setToken, () => setHasAuthError(true));
          }
        }
      });
    } else if (localStorage.getItem(config.GOOGLE_ENABLED)) {
      launchGoogleAuthFlow(true, setToken, () => setHasAuthError(true));
    } else {
      setDoneFetchingToken(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const result = await db('production');
      if (result) {
        setDatabase(result);
      } else {
        setHasDatabaseError(true);
      }
    };
    void fetchData();
  }, []);

  const shouldShowLoading = !hasAuthError && !hasDatabaseError && !database;

  return (
    <div className="main-content-container main-content-responsive-container extension-context">
      {hasDatabaseError && (
        <div className="popup-error">
          <div className="alert">
            <div className="alert-title">Please restart your browser</div>
            <div className="alert-content">
              Unable to connect to the database. This is an issue I do not fully understand where
              the database does not accept connections. If you are familiar with connection issues
              with indexdb, please email brennan@kelp.nyc.
            </div>
          </div>
        </div>
      )}
      {hasAuthError && (
        <div className="popup-error">
          <div className="alert">
            <div className="alert-title">Authentication Error</div>
            <div className="alert-content">
              Please login with Google
              <br />
              <br />
              <button
                className="popup-button"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Try again
              </button>
              <br />
              <br />
              Please email <a href="mailto:brennan@kelp.nyc">brennan@kelp.nyc</a> with questions.
            </div>
          </div>
        </div>
      )}
      {hasGoogleAdvancedProtectionError && (
        <div className="popup-error">
          <div className="alert">
            <div className="alert-title">Authentication Error</div>
            <div className="alert-content">
              It looks like your organization has the{' '}
              <a
                href="https://landing.google.com/advancedprotection/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Advanced Protection Program
              </a>{' '}
              enabled.
              <br />
              <br />
              Ask your IT administrator to whitelist:
              <br />
              <br />
              <button
                className="popup-button"
                onClick={(event) => {
                  event.stopPropagation();
                  void navigator.clipboard.writeText(getGoogleClientID());
                  return false;
                }}
              >
                {getGoogleClientID()}
              </button>
              <br />
              <small>Click to copy to your clipboard</small>
              <br />
              <br />
              Please email <a href="mailto:brennan@kelp.nyc">brennan@kelp.nyc</a> with questions.
            </div>
          </div>
        </div>
      )}
      {(shouldShowLoading || isMicrosoftLoading) && (
        <div className="popup-loading">
          <div className="popup-loading-content">
            <div
              className="popup-loading-spinner popup-loading-spinner--large"
              role="progressbar"
              aria-label="Loading"
            ></div>
            <div className="popup-loading-title">Loading</div>
            <div className="popup-loading-message">
              {isMicrosoftLoading
                ? 'Authenticating with Microsoft...'
                : 'Initializing application...'}
            </div>
          </div>
        </div>
      )}
      {!hasAuthError && !hasDatabaseError && database && (isDoneFetchingToken || token) && (
        <div className="extension-dashboard">
          <LoadingMobileDashboardContainer
            database={database}
            accessToken={token || undefined}
            scope={scopes}
            setTheme={props.setTheme}
            theme={props.theme}
            isMicrosoftError={isMicrosoftError}
            isMicrosoftLoading={isMicrosoftLoading}
          />
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [theme, setTheme] = useState<string>('dark');
  const [materialUITheme, setMaterialUITheme] = useState<any>(darkTheme);

  useEffect(() => {
    const initTheme = async (): Promise<void> => {
      // Get stored theme
      const t = await chrome.storage.sync.get(config.THEME);
      const currentTheme = t[config.THEME] || localStorage.getItem(config.THEME) || 'dark';

      // Initialize CSS custom properties theme system with Material-UI sync
      await initializeTheme(currentTheme as ThemeName);

      // Create synchronized Material-UI theme
      const baseTheme =
        currentTheme === 'dark'
          ? darkTheme
          : currentTheme === 'light'
            ? lightTheme
            : currentTheme === 'cool'
              ? coolTheme
              : nbTheme;

      const muiThemeConfig = createMaterialUIThemeConfig(currentTheme as ThemeName);
      const syncedTheme = createTheme(baseTheme, muiThemeConfig);

      setTheme(currentTheme);
      setMaterialUITheme(syncedTheme);
    };
    void initTheme();
  }, []);

  const handleThemeChange = async (newTheme: string): Promise<void> => {
    // Update CSS custom properties system
    await switchTheme(newTheme as ThemeName);

    // Create synchronized Material-UI theme
    const baseTheme =
      newTheme === 'dark'
        ? darkTheme
        : newTheme === 'light'
          ? lightTheme
          : newTheme === 'cool'
            ? coolTheme
            : nbTheme;

    const muiThemeConfig = createMaterialUIThemeConfig(newTheme as ThemeName);
    const syncedTheme = createTheme(baseTheme, muiThemeConfig);

    setTheme(newTheme);
    setMaterialUITheme(syncedTheme);
  };

  return (
    <StyledEngineProvider injectFirst>
      <EmotionThemeProvider theme={materialUITheme}>
        <ThemeProvider theme={materialUITheme}>
          <CssBaseline />
          <MsalProvider instance={msalInstance}>
            <MainContent setTheme={handleThemeChange} theme={theme} />
          </MsalProvider>
        </ThemeProvider>
      </EmotionThemeProvider>
    </StyledEngineProvider>
  );
};

const mountNode = document.getElementById('popup');
if (mountNode) {
  const root = createRoot(mountNode);
  root.render(<App />);
}
