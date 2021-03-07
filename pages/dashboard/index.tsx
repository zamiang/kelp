import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import Docs from '../../components/dashboard/documents';
import Home from '../../components/dashboard/home';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import Summary from '../../components/dashboard/summary';
import WeekCalendar from '../../components/dashboard/week-calendar';
import ExpandedDocument from '../../components/documents/expand-document';
import ErrorBoundaryComponent from '../../components/error-tracking/error-boundary';
import { fetchToken } from '../../components/fetch/fetch-token';
import ExpandedMeeting from '../../components/meeting/expand-meeting';
import MobileDashboard from '../../components/mobile/dashboard';
import NavBar from '../../components/nav/nav-bar';
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
  container: {
    transition: 'background 0.3s',
  },
  content: {
    overscrollBehavior: 'contain',
    flexGrow: 1,
    overflowX: 'hidden',
  },
  left: {
    maxWidth: 440,
    maxHeight: 'calc(100vh - 49px)', // calc(100vh - 104px)',
    overflowX: 'hidden',
    background: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  center: {
    margin: '0px auto',
    marginTop: theme.spacing(2),
    background: theme.palette.background.paper,
    maxHeight: 'calc(100vh - 49px)',
    maxWidth: 708,
    position: 'relative',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
  const classes = useStyles();
  const store = props.store;
  const handleRefreshClick = () => store.refetch();

  return (
    <ErrorBoundaryComponent>
      <NavBar handleRefreshClick={handleRefreshClick} store={store} />
      <main className={classes.content}>
        <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>Please reload the page
            <Typography>{store.error}</Typography>
          </Alert>
        </Dialog>
        <NotificationsPopup />
        <MeetingPrepNotifications {...store} />
        <Switch>
          <Route path="/week">
            <WeekCalendar {...store} />
          </Route>
          <Route path="/summary">
            <Summary {...store} />
          </Route>
          <Route path="/search">
            <Container>
              <Grid container spacing={4} alignItems="flex-start">
                <Grid item xs={12} sm={6}>
                  <div className={classes.center}>
                    <Search store={store} />
                  </div>
                </Grid>
                <Route path="/search/docs/:slug">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <ExpandedDocument store={store} />
                    </div>
                  </Grid>
                </Route>
                <Route path="/search/meetings/:slug">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <ExpandedMeeting store={store} />
                    </div>
                  </Grid>
                </Route>
                <Route path="/search/people/:slug">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <ExpandPerson store={store} />
                    </div>
                  </Grid>
                </Route>
              </Grid>
            </Container>
          </Route>
          <Route path="/settings">
            <Settings shouldRenderHeader={true} />
          </Route>
          <Route path="/meetings">
            <Grid container alignItems="flex-start">
              <Grid item>
                <div className={classes.left}>
                  <Meetings store={store} />
                </div>
              </Grid>
              <Route path="/meetings/:slug">
                <Grid item xs>
                  <div className={classes.center}>
                    <ExpandedMeeting store={store} />
                  </div>
                </Grid>
              </Route>
            </Grid>
          </Route>
          <Route path="/docs">
            <Grid container alignItems="flex-start">
              <Grid item>
                <div className={classes.left}>
                  <Docs store={store} />
                </div>
              </Grid>
              <Route path="/docs/:slug">
                <Grid item xs>
                  <div className={classes.center}>
                    <ExpandedDocument store={store} />
                  </div>
                </Grid>
              </Route>
            </Grid>
          </Route>
          <Route path="/people">
            <Grid container alignItems="flex-start">
              <Grid item>
                <div className={classes.left}>
                  <People store={store} />
                </div>
              </Grid>
              <Route path="/people/:slug">
                <Grid item xs>
                  <div className={classes.center}>
                    <ExpandPerson store={store} />
                  </div>
                </Grid>
              </Route>
            </Grid>
          </Route>
          <Route path="/dashboard">
            <Home {...store} />
          </Route>
          <Route exact path="/">
            <Redirect to="/meetings" />
          </Route>
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
  const classes = useStyles();
  console.log('loading message', store.loadingMessage);
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 30); // 30 minutes
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={classes.container}>
      <Head>
        <title>Dashboard - Kelp</title>
      </Head>
      {isMobile ? <MobileDashboard store={store} /> : <DesktopDashboard store={store} />}
    </div>
  );
};

export default LoadingDashboardContainer;
