import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import {
  Route,
  MemoryRouter as Router,
  Link as RouterLink,
  Switch,
  useLocation,
} from 'react-router-dom';
import { DocumentsForToday } from '../../components/dashboard/documents';
import MeetingRow from '../../components/meeting/meeting-row';
import RefreshButton from '../../components/nav/refresh-button';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import { IPerson } from '../../components/store/models/person-model';
import { ISegment } from '../../components/store/models/segment-model';
import getStore from '../../components/store/use-store';
import config from '../../constants/config';
import theme from '../../constants/theme';

const scopes = config.GOOGLE_SCOPES.join(' ');

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

const Info = (props: { database: any; accessToken: string; scope: string }) => {
  const store = getStore(props.database, props.accessToken, props.scope);
  const classes = useInfoStyles();
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
      <header className={classes.drawerPaper}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Link to="/meetings" component={RouterLink}>
              <img className={classes.logo} src="/logo.svg" alt="Kelp logo" />
            </Link>
          </Grid>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <RefreshButton
                  isLoading={store.isLoading}
                  refresh={store.refetch}
                  lastUpdated={store.lastUpdated}
                  loadingMessage={store.loadingMessage}
                />
              </Grid>
              {user && (
                <Grid item>
                  <IconButton
                    className={'ignore-react-onclickoutside'}
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                  >
                    <Avatar
                      className={clsx(classes.unSelected, classes.icon)}
                      src={user.imageUrl || undefined}
                      alt={user.name || user.emailAddresses[0] || undefined}
                    />
                  </IconButton>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </header>
      <Switch>
        <Route path="/meetings">
          <div className={classes.homeRow}>
            <Typography variant="h6" className={classes.smallHeading}>
              Today&apos;s schedule
            </Typography>
            <Divider />
            {segments.map((meeting) => (
              <MeetingRow
                key={meeting.id}
                meeting={meeting}
                selectedMeetingId={selectedMeetingId}
                store={store}
                shouldRenderCurrentTime={false}
              />
            ))}
            <Typography variant="h6" className={classes.smallHeading}>
              Documents you may need today
            </Typography>
            <Divider />
            <DocumentsForToday {...store} selectedDocumentId={null} isSmall={true} />
          </div>
        </Route>
        <Route path="/settings"></Route>
        <Route>
          <Handle404 />
        </Route>
      </Switch>
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  app: {
    width: 360,
    minHeight: 300,
  },
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
      <div className={classes.app}>
        <header className={classes.header}>
          <Loading isOpen={!token || !database} message="Loading" />
        </header>
        {token && database && (
          <Router initialEntries={['/meetings', '/settings']} initialIndex={0}>
            <Info database={database} accessToken={token} scope={scopes} />
          </Router>
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
