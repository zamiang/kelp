import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Switch, useHistory, useLocation } from 'react-router-dom';
import Docs from '../../components/dashboard/documents';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import ExpandedDocument from '../../components/documents/expand-document';
import ErrorBoundaryComponent from '../../components/error-tracking/error-boundary';
import { fetchToken } from '../../components/fetch/fetch-token';
import ExpandedMeeting from '../../components/meeting/expand-meeting';
import MobileDashboard from '../../components/mobile/dashboard';
import NavBar from '../../components/nav/nav-bar';
import NavRight from '../../components/nav/nav-right';
import MeetingPrepNotifications from '../../components/notifications/meeting-prep-notifications';
import NotificationsPopup from '../../components/notifications/notifications-popup';
import ExpandPerson from '../../components/person/expand-person';
import Loading from '../../components/shared/loading';
import { ScrollToTop } from '../../components/shared/scroll-to-top';
import db from '../../components/store/db';
import getStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';

export const drawerWidth = 240;
export const MOBILE_WIDTH = 700;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    overscrollBehavior: 'contain',
    flexGrow: 1,
    background: theme.palette.secondary.light,
    minHeight: '100vh',
  },
  left: {
    maxWidth: 440,
    background: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    width: '33vw',
  },
  right: {
    position: 'sticky',
    top: 0,
    right: 0,
  },
  center: {
    margin: '0px auto',
    marginTop: theme.spacing(4),
    borderRadius: theme.shape.borderRadius,
    background: theme.palette.background.paper,
    maxWidth: 708,
    position: 'relative',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    maxHeight: 'calc(100vh - 33px)',
    overflow: 'auto',
    width: '100%',
  },
}));

const LoadingDashboardContainer = () => {
  const [database, setDatabase] = useState<any>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [scope, setScope] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setDatabase(await db('production'));
    };
    void fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const t = await fetchToken();
      setToken(t.accessToken);
      setScope(t.scope);
    };
    void fetchData();
  }, []);

  return (
    <React.Fragment>
      <Loading isOpen={!token || !database} message="Loading" />
      {(process as any).browser && database && token && scope && (
        <LoadingStoreDashboardContainer
          database={database}
          googleOauthToken={token}
          scope={scope}
        />
      )}
    </React.Fragment>
  );
};

const LoadingStoreDashboardContainer = (props: {
  database: any;
  googleOauthToken: string;
  scope: string;
}) => {
  const store = getStore(props.database, props.googleOauthToken, props.scope);
  return (
    <div suppressHydrationWarning={true}>
      <Router basename="/dashboard">
        <ScrollToTop />
        <DashboardContainer store={store} />
      </Router>
    </div>
  );
};

const DesktopDashboard = (props: { store: IStore }) => {
  const history = useHistory();
  const classes = useStyles();
  const store = props.store;
  const handleRefreshClick = () => store.refetch();

  // Unsure why the <Redirect component doesn't work anymore
  if (useLocation().pathname === '/') {
    history.push(`/meetings`);
  }

  return (
    <ErrorBoundaryComponent>
      <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>Please reload the page
          <Typography>{store.error}</Typography>
        </Alert>
      </Dialog>
      <NotificationsPopup />
      <MeetingPrepNotifications {...store} />
      <main className={classes.content}>
        <Switch>
          <Grid container alignItems="flex-start">
            <Route path="/search">
              <Grid item className={classes.left}>
                <NavBar />
                <Search store={store} />
              </Grid>
            </Route>
            <Route path="/meetings">
              <Grid item className={classes.left}>
                <NavBar />
                <Meetings store={store} />
              </Grid>
            </Route>
            <Route path="/docs">
              <Grid item className={classes.left}>
                <NavBar />
                <Docs store={store} />
              </Grid>
            </Route>
            <Route path="/people">
              <Grid item className={classes.left}>
                <NavBar />
                <People store={store} />
              </Grid>
            </Route>
            <Grid item xs className={classes.right}>
              <NavRight handleRefreshClick={handleRefreshClick} store={store} />
              <div className={classes.center}>
                <Route path="/search/docs/:slug">
                  <ExpandedDocument store={store} />
                </Route>
                <Route path="/search/meetings/:slug">
                  <ExpandedMeeting store={store} />
                </Route>
                <Route path="/search/people/:slug">
                  <ExpandPerson store={store} />
                </Route>
                <Route path="/settings">
                  <Settings shouldRenderHeader={true} />
                </Route>
                <Route path="/meetings/:slug">
                  <ExpandedMeeting store={store} />
                </Route>
                <Route path="/docs/:slug">
                  <ExpandedDocument store={store} />
                </Route>
                <Route path="/people/:slug">
                  <ExpandPerson store={store} />
                </Route>
              </div>
            </Grid>
          </Grid>
        </Switch>
      </main>
    </ErrorBoundaryComponent>
  );
};

interface IProps {
  store: IStore;
}

const is500Error = (error: Error) => (error as any).status === 500;

export const DashboardContainer = ({ store }: IProps) => {
  console.log('loading message', store.loadingMessage);
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 30); // 30 minutes
    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <Head>
        <title>Dashboard - Kelp</title>
      </Head>
      {isMobile ? <MobileDashboard store={store} /> : <DesktopDashboard store={store} />}
    </div>
  );
};

export default LoadingDashboardContainer;
