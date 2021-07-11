import {
  AuthenticationResult,
  EventMessage,
  EventType,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import { MemoryRouter as Router } from 'react-router-dom';
import { DesktopDashboard } from '../../components/dashboard/desktop-dashboard';
import { msalConfig } from '../../components/fetch/microsoft/auth-config';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import getStore from '../../components/store/use-store';
import config from '../../constants/config';
import theme from '../../constants/theme';

const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  console.log(event, 'event from msal instance');
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  } else if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
    // TODO: ???
    console.log('acquire token failure');
    // void msalInstance.acquireTokenSilent({
    //  scopes: ['Calendars.Read', 'openid', 'profile', 'offline_access],
    // });
  }
});

const scopes = config.GOOGLE_SCOPES.join(' ');
const GOOGLE_CLIENT_ID = '296254551365-v8olgrucl4t2b1oa22fnr1r23390umvl.apps.googleusercontent.com';

const LoadingMobileDashboardContainer = (props: {
  database: any;
  accessToken: string;
  scope: string;
}) => {
  const { instance } = useMsal();
  const currentAccount = instance.getActiveAccount();
  const store = getStore(
    props.database,
    props.accessToken,
    props.scope,
    currentAccount || undefined,
    instance,
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
          <DesktopDashboard store={store} />
        </Router>
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: theme.palette.background.paper,
  },
}));

const App = () => {
  const [token, setToken] = useState<string | null>(null);
  const [hasAuthError, setHasAuthError] = useState<boolean>(false);
  const [hasDatabaseError, setHasDatabaseError] = useState<boolean>(false);
  const [database, setDatabase] = useState<any>(undefined);
  const classes = useStyles();

  useEffect(() => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        if (
          chrome.runtime.lastError.message?.includes('Service has been disabled for this account')
        ) {
          setHasAuthError(true);
        }
      } else {
        setToken(token);
      }
    });
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
  const shouldShowLoading = !hasAuthError && !hasDatabaseError && (!token || !database);
  return (
    <ThemeProvider theme={theme}>
      <MsalProvider instance={msalInstance}>
        <CssBaseline />
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
                  variant="outlined"
                  onClick={(event) => {
                    event.stopPropagation();
                    void navigator.clipboard.writeText(GOOGLE_CLIENT_ID);
                    return false;
                  }}
                >
                  <Typography noWrap variant="caption">
                    {GOOGLE_CLIENT_ID}
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
        {shouldShowLoading && (
          <div className={classes.header}>
            <Loading isOpen={!token || !database} message="Loading" />
          </div>
        )}
        {!hasAuthError && token && database && (
          <LoadingMobileDashboardContainer database={database} accessToken={token} scope={scopes} />
        )}
      </MsalProvider>
    </ThemeProvider>
  );
};

const mountNode = document.getElementById('popup');
ReactDOM.render(<App />, mountNode);
