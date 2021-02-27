import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect, useState } from 'react';
import { Route, MemoryRouter as Router, Switch, useHistory } from 'react-router-dom';
import Documents from '../../../components/dashboard/documents';
import Meetings from '../../../components/dashboard/meetings';
import People from '../../../components/dashboard/people';
import Search from '../../../components/dashboard/search';
import ExpandedDocument from '../../../components/documents/expand-document';
import ExpandedMeeting from '../../../components/meeting/expand-meeting';
import ExpandPerson from '../../../components/person/expand-person';
import Loading from '../../../components/shared/loading';
import db from '../../../components/store/db';
import { IPerson } from '../../../components/store/models/person-model';
import getStore from '../../../components/store/use-store';
import Settings from '../../../components/user-profile/settings';
import config from '../../../constants/config';
import theme from '../../../constants/theme';
import Handle404 from './handle-404';
import PopupHeader from './popup-header';

const scopes = config.GOOGLE_SCOPES.join(' ');

const useInfoStyles = makeStyles((theme) => ({
  homeRow: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  smallHeading: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    width: '100%',
    fontWeight: 500,
    display: 'block',
    '&:first-child': {
      marginTop: 0,
    },
  },
  container: {
    position: 'relative',
    maxHeight: 504,
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    zIndex: 15,
  },
}));

const Popup = (props: { database: any; accessToken: string; scope: string }) => {
  const store = getStore(props.database, props.accessToken, props.scope);
  const classes = useInfoStyles();
  const history = useHistory();

  const [user, setUser] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const user = await store.personDataStore.getSelf();
      if (user) {
        setUser(user);
      }
    };
    void fetchData();
  }, [props.accessToken, store.isLoading]);

  return (
    <div>
      <PopupHeader user={user} store={store} />
      <div className={classes.container}>
        <Switch>
          <Route path="/search/docs/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/search/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/search/people/:slug">
            <ExpandPerson store={store} />
          </Route>
          <Route path="/search">
            <Search store={store} />
          </Route>
          <Route path="/people/:slug">
            <ExpandPerson store={store} />
          </Route>
          <Route path="/docs/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/meetings">
            <Meetings hideHeading store={store} />
          </Route>
          <Route path="/people">
            <People hideHeading store={store} />
          </Route>
          <Route path="/documents">
            <Documents hideHeading store={store} />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route>
            <Handle404 />
          </Route>
        </Switch>
      </div>
      <footer className={classes.footer}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs={4}>
            <IconButton
              onClick={() => {
                history.push('/meetings');
              }}
            >
              <HomeIcon />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <IconButton
              onClick={() => {
                history.push('/people');
              }}
            >
              <GroupIcon />
            </IconButton>
          </Grid>
          <Grid item xs={4}>
            <IconButton
              onClick={() => {
                history.push('/documents');
              }}
            >
              <InsertDriveFileIcon />
            </IconButton>
          </Grid>
        </Grid>
      </footer>
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
      setToken(token);
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
        <Router initialEntries={['/meetings', '/settings']} initialIndex={0}>
          <Popup database={database} accessToken={token} scope={scopes} />
        </Router>
      )}
    </ThemeProvider>
  );
};

export default App;
