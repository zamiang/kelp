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
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { StyledEngineProvider, styled } from '@mui/material/styles';
import ThemeProvider from '@mui/styles/ThemeProvider';
import { subMinutes } from 'date-fns';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import { MemoryRouter as Router, useLocation } from 'react-router-dom';
import { DesktopDashboard } from '../../components/dashboard/desktop-dashboard';
import { msalConfig } from '../../components/fetch/microsoft/auth-config';
import { getGoogleClientID, launchGoogleAuthFlow } from '../../components/shared/google-login';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import getStore from '../../components/store/use-store';
import config from '../../constants/config';
import { coolTheme, darkTheme, lightTheme, nbTheme } from '../../constants/theme';

const msalInstance = new PublicClientApplication(msalConfig);

const PREFIX = 'Popup';

const classes = {
  button: `${PREFIX}-button`,
};

const PopupContainer = styled('div')(() => ({
  [`& .${classes.button}`]: {
    width: '100%',
    borderRadius: 30,
    paddingTop: 6,
    paddingBottom: 6,
    transition: 'opacity 0.3s',
    minHeight: 48,
    opacity: 1,
    paddingLeft: 20,
    paddingRight: 20,
    '&:hover': {
      opacity: 0.6,
    },
  },
}));

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

const Popup = (props: { theme: string; setTheme: (t: string) => void }) => {
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
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          if (
            chrome.runtime.lastError.message?.includes('Service has been disabled for this account')
          ) {
            setHasGoogleAdvancedProtectionError(true);
          } else {
            setHasAuthError(true);
          }
        } else if (token) {
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
    <PopupContainer>
      {hasDatabaseError && (
        <Container maxWidth="sm" style={{ marginTop: '40vh' }}>
          <Alert severity="error">
            <AlertTitle>Please restart your browser</AlertTitle>
            <Typography>
              Unable to connect to the database. This is an issue I do not fully understand where
              the database does not accept connections. If you are familar with connection issues
              with indexdb, please email brennan@kelp.nyc.
            </Typography>
          </Alert>
        </Container>
      )}
      {hasAuthError && (
        <Container maxWidth="sm" style={{ marginTop: '40vh' }}>
          <Alert severity="error">
            <AlertTitle>Authentication Error</AlertTitle>
            <Typography>
              Please login with Google
              <br />
              <br />
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={() => {
                  window.location.reload();
                }}
              >
                <Typography noWrap variant="caption">
                  Try again
                </Typography>
              </Button>
              <br />
              <br />
              Please email <Link href="mailto:brennan@kelp.nyc">brennan@kelp.nyc</Link> with
              questions.
            </Typography>
          </Alert>
        </Container>
      )}
      {hasGoogleAdvancedProtectionError && (
        <Container maxWidth="sm" style={{ marginTop: '40vh' }}>
          <Alert severity="error">
            <AlertTitle>Authentication Error</AlertTitle>
            <Typography>
              It looks like your organization has the{' '}
              <Link href="https://landing.google.com/advancedprotection/">
                Google Advanced Protection Program
              </Link>{' '}
              enabled.
              <br />
              <br />
              Ask your IT administrator to whitelist
              <br />
              <br />
              <Button
                className={classes.button}
                variant="contained"
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  void navigator.clipboard.writeText(getGoogleClientID());
                  return false;
                }}
              >
                <Typography noWrap variant="caption">
                  {getGoogleClientID()}
                </Typography>
              </Button>
              <br />
              <Typography variant="caption">Click to copy to your clipboard</Typography>
              <br />
              <br />
              Please email <Link href="mailto:brennan@kelp.nyc">brennan@kelp.nyc</Link> with
              questions.
            </Typography>
          </Alert>
        </Container>
      )}
      {(shouldShowLoading || isMicrosoftLoading) && (
        <div>
          <Loading isOpen={!token || !database} message="Loading" />
        </div>
      )}
      {!hasAuthError && database && (isDoneFetchingToken || token) && (
        <LoadingMobileDashboardContainer
          database={database}
          accessToken={token || undefined}
          scope={scopes}
          setTheme={props.setTheme}
          theme={props.theme}
          isMicrosoftError={isMicrosoftError}
          isMicrosoftLoading={isMicrosoftLoading}
        />
      )}
    </PopupContainer>
  );
};

const themeHash = {
  nb: nbTheme,
  cool: coolTheme,
  light: lightTheme,
  dark: darkTheme,
} as any;

const App = () => {
  const [theme, setTheme] = useState<string>('dark');
  useEffect(() => {
    const getTheme = async (): Promise<void> => {
      const t = await chrome.storage.sync.get(config.THEME);
      setTheme(t[config.THEME] || localStorage.getItem(config.THEME) || 'dark');
    };
    void getTheme();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <EmotionThemeProvider theme={themeHash[theme]}>
        <ThemeProvider theme={themeHash[theme]}>
          <CssBaseline />
          <MsalProvider instance={msalInstance}>
            <Popup setTheme={setTheme} theme={theme} />
          </MsalProvider>
        </ThemeProvider>
      </EmotionThemeProvider>
    </StyledEngineProvider>
  );
};

const mountNode = document.getElementById('popup');
ReactDOM.render(<App />, mountNode);
