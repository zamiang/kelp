import { makeStyles } from '@material-ui/core/styles';
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
  const [database, setDatabase] = useState<any>(undefined);
  const classes = useStyles();

  useEffect(() => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        if (
          chrome.runtime.lastError.message?.includes('Service has been disabled for this account')
        ) {
          console.log('error');
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
