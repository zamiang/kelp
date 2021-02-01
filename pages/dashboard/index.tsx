import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import clsx from 'clsx';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import { Route, BrowserRouter as Router, Switch, useHistory, useLocation } from 'react-router-dom';
import Docs from '../../components/dashboard/documents';
import Home from '../../components/dashboard/home';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import Summary from '../../components/dashboard/summary';
import WeekCalendar from '../../components/dashboard/week-calendar';
import ErrorBoundaryComponent from '../../components/error-tracking/error-boundary';
import BottomNav from '../../components/nav/bottom-nav-bar';
import NavBar from '../../components/nav/nav-bar';
import MeetingPrepNotifications from '../../components/notifications/meeting-prep-notifications';
import NotificationsPopup from '../../components/notifications/notifications-popup';
import db from '../../components/store/db';
import useGapi from '../../components/store/use-gapi';
import getStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';
import config from '../../constants/config';

export const drawerWidth = 240;
export const MOBILE_WIDTH = 700;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  container: {
    display: 'flex',
    transition: 'background 0.3s',
  },
  content: {
    background: 'white',
    overscrollBehavior: 'contain',
    flexGrow: 1,
  },
  center: {
    maxWidth: MOBILE_WIDTH + 100,
    margin: '0px auto',
  },
  grayBackground: {
    backgroundColor: '#F4F5F7',
  },
  yellowBackground: {
    backgroundColor: config.YELLOW_BACKGROUND,
  },
  orangeBackground: {
    backgroundColor: config.ORANGE_BACKGROUND,
  },
  purpleBackground: {
    backgroundColor: config.PURPLE_BACKGROUND,
  },
  pinkBackground: {
    backgroundColor: config.PINK_BACKGROUND,
  },
  blueBackground: {
    backgroundColor: config.BLUE_BACKGROUND,
  },
}));

const useBackdropStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const LoadingDashboardContainer = () => {
  const isSignedIn = useGapi();
  const router = useHistory();
  const [session, isLoading] = useSession();
  const [database, setDatabase] = useState<any>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      setDatabase(await db('production'));
    };
    void fetchData();
  }, []);

  if (!isLoading && !session?.user) {
    void router.push('/');
  }
  return (
    <React.Fragment>
      <Loading isOpen={!isSignedIn || isLoading || !database} message="Loading" />
      {database && isSignedIn && !isLoading && (
        <LoadingStoreDashboardContainer database={database} />
      )}
    </React.Fragment>
  );
};

const LoadingStoreDashboardContainer = (props: { database: any }) => {
  const store = getStore(props.database);
  return (
    <div suppressHydrationWarning={true}>
      {(process as any).browser && !store.isLoading && (
        <Router basename="/dashboard">
          <DashboardContainer store={store} />
        </Router>
      )}
    </div>
  );
};

export const Loading = (props: { isOpen: boolean; message: string }) => {
  const classes = useBackdropStyles();
  return (
    <Backdrop className={classes.backdrop} open={props.isOpen}>
      <Grid container alignItems="center" justify="center">
        <Grid item style={{ width: '100%', textAlign: 'center' }}>
          <CircularProgress color="inherit" />
        </Grid>
        <Grid item>
          <Typography variant="h5">{props.message}</Typography>
        </Grid>
      </Grid>
    </Backdrop>
  );
};

const Nav = (props: { refToUse: any; lastUpdated: Date; handleRefreshClick: () => void }) => (
  <React.Fragment>
    <NavBar lastUpdated={props.lastUpdated} handleRefreshClick={props.handleRefreshClick} />
    <BottomNav />
  </React.Fragment>
);

interface IProps {
  store: IStore;
}

const is500Error = (error: Error) => (error as any).status === 500;

export const DashboardContainer = ({ store }: IProps) => {
  const ref = useRef(null);
  const classes = useStyles();
  const handleRefreshClick = () => store.refetch();
  const location = useLocation().pathname.split('/')[1];
  const shouldCenter = ['docs', 'people', 'meetings', 'search'].indexOf(location) > -1;

  const colorHash = {
    week: classes.grayBackground,
    summary: classes.grayBackground,
    search: classes.grayBackground,
    settings: classes.grayBackground,
    meetings: classes.blueBackground,
    docs: classes.pinkBackground,
    people: classes.orangeBackground,
    '': classes.grayBackground,
  } as any;

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 10); // 10 minutes
    return () => clearInterval(interval);
  }, []);
  return (
    <div ref={ref} className={clsx(classes.container, colorHash[location])}>
      <Head>
        <title>Dashboard - Kelp</title>
      </Head>
      <Nav refToUse={ref} lastUpdated={store.lastUpdated} handleRefreshClick={handleRefreshClick} />
      <main className={clsx(classes.content, shouldCenter && classes.center)}>
        <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>Please reload the page
            <Typography>{store.error}</Typography>
          </Alert>
        </Dialog>
        <NotificationsPopup />
        <MeetingPrepNotifications {...store} />
        <ErrorBoundaryComponent>
          <Switch>
            <Route path="/week">
              <WeekCalendar {...store} />
            </Route>
            <Route path="/meetings">
              <Meetings {...store} />
            </Route>
            <Route path="/docs">
              <Docs {...store} />
            </Route>
            <Route path="/people">
              <People {...store} />
            </Route>
            <Route path="/summary">
              <Summary {...store} />
            </Route>
            <Route path="/search">
              <Search {...store} />
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/">
              <Home {...store} />
            </Route>
          </Switch>
        </ErrorBoundaryComponent>
      </main>
    </div>
  );
};

export default LoadingDashboardContainer;
