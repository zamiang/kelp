import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import SearchIcon from '@material-ui/icons/Search';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import {
  Route,
  MemoryRouter as Router,
  Link as RouterLink,
  Switch,
  useHistory,
  useLocation,
} from 'react-router-dom';
import Documents from '../../components/dashboard/documents';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import ExpandedDocument from '../../components/documents/expand-document';
import ExpandedMeeting from '../../components/meeting/expand-meeting';
import MeetingRow from '../../components/meeting/meeting-row';
import RefreshButton from '../../components/nav/refresh-button';
import SearchBar from '../../components/nav/search-bar';
import ExpandPerson from '../../components/person/expand-person';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import { IPerson } from '../../components/store/models/person-model';
import { ISegment } from '../../components/store/models/segment-model';
import getStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';
import config from '../../constants/config';
import theme from '../../constants/theme';

const scopes = config.GOOGLE_SCOPES.join(' ');

const useHeaderStyles = makeStyles((theme) => ({
  logo: {
    width: 24,
    height: 24,
  },
  drawerPaper: {
    border: '0px',
    position: 'sticky',
    top: 0,
    left: 0,
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    zIndex: 6,
    justifyContent: 'space-between',
  },
  unSelected: {
    color: theme.palette.text.primary,
    transition: 'border 0.3s',
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  icon: {
    width: 22,
    height: 22,
  },
}));

const PluginHeader = (props: { store: IStore; user?: IPerson }) => {
  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(false);
  const classes = useHeaderStyles();
  const history = useHistory();

  if (isSearchInputVisible) {
    return (
      <header className={classes.drawerPaper}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <SearchBar />
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                history.push('/meetings');
                setSearchInputVisible(false);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
      </header>
    );
  }

  return (
    <header className={classes.drawerPaper}>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <Link to="/meetings" component={RouterLink}>
                <img className={classes.logo} src="/logo.svg" alt="Kelp logo" />
              </Link>
            </Grid>
            <Grid item>
              <IconButton onClick={() => setSearchInputVisible(true)}>
                <SearchIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            {isSearchInputVisible && (
              <Grid item>
                <IconButton>
                  <CloseIcon />
                </IconButton>
              </Grid>
            )}
            <Grid item>
              <RefreshButton
                isLoading={props.store.isLoading}
                refresh={props.store.refetch}
                lastUpdated={props.store.lastUpdated}
                loadingMessage={props.store.loadingMessage}
              />
            </Grid>
            {props.user && (
              <Grid item>
                <IconButton
                  className={'ignore-react-onclickoutside'}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={() => history.push('/settings')}
                >
                  <Avatar
                    className={clsx(classes.unSelected, classes.icon)}
                    src={props.user.imageUrl || undefined}
                    alt={props.user.name || props.user.emailAddresses[0] || undefined}
                  />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </header>
  );
};

const Handle404 = () => {
  const newURL = `https://www.kelp.nyc/dashboard${useLocation().pathname}`;
  useEffect(() => {
    chrome.tabs.create({ url: newURL });
  }, [newURL]);

  return null;
};

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

const Info = (props: { database: any; accessToken: string; scope: string }) => {
  const store = getStore(props.database, props.accessToken, props.scope);
  const classes = useInfoStyles();
  const history = useHistory();
  const [segments, setSegments] = useState<ISegment[]>([]);
  const [user, setUser] = useState<IPerson | undefined>(undefined);
  const selectedMeetingId = useLocation().pathname.replace('/meetings', '').replace('/', '');

  useEffect(() => {
    const fetchData = async () => {
      const currentTime = new Date();
      const result = await store.timeDataStore.getSegmentsForDay(currentTime);
      setSegments(result.sort((a, b) => (a.start < b.start ? -1 : 1)));
    };
    void fetchData();
  }, [props.accessToken, store.isLoading]);

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
      <PluginHeader user={user} store={store} />
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
            <div className={classes.homeRow}>
              {segments.map((meeting) => (
                <MeetingRow
                  key={meeting.id}
                  meeting={meeting}
                  selectedMeetingId={selectedMeetingId}
                  store={store}
                  shouldRenderCurrentTime={false}
                />
              ))}
            </div>
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
        <header className={classes.header}>
          <Loading isOpen={!token || !database} message="Loading" />
        </header>
      )}
      {token && database && (
        <Router initialEntries={['/meetings', '/settings']} initialIndex={0}>
          <Info database={database} accessToken={token} scope={scopes} />
        </Router>
      )}
    </ThemeProvider>
  );
};

export default App;
