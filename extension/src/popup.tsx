import Button from '@material-ui/core/Button';
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
import MobileDashboard from '../../components/mobile/dashboard';
import Loading from '../../components/shared/loading';
import { ScrollToTop } from '../../components/shared/scroll-to-top';
import db from '../../components/store/db';
import getStore from '../../components/store/use-store';
import config from '../../constants/config';
import theme from '../../constants/theme';

const scopes = config.GOOGLE_SCOPES.join(' ');
const GOOGLE_CLIENT_ID = '296254551365-v8olgrucl4t2b1oa22fnr1r23390umvl.apps.googleusercontent.com';

const LoadingMobileDashboardContainer = (props: {
  database: any;
  accessToken: string;
  scope: string;
}) => {
  const store = getStore(props.database, props.accessToken, props.scope);

  return (
    <div>
      <Router initialEntries={['/meetings', '/settings']} initialIndex={0}>
        <ScrollToTop />
        <MobileDashboard store={store} />
      </Router>
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
      setDatabase(await db('production'));
    };
    void fetchData();
  }, []);
  return (
    <ThemeProvider theme={theme}>
      {hasAuthError && (
        <Alert severity="error">
          <AlertTitle>Authentication Error</AlertTitle>
          <Typography style={{ width: 315 }}>
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
      )}
      {(!token || !database) && (
        <div className={classes.header}>
          <Loading isOpen={!token || !database} message="Loading" />
        </div>
      )}
      {token && database && (
        <LoadingMobileDashboardContainer database={database} accessToken={token} scope={scopes} />
      )}
    </ThemeProvider>
  );
};

const mountNode = document.getElementById('popup');
ReactDOM.render(<App />, mountNode);
