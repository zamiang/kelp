import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Switch, useHistory, useLocation } from 'react-router-dom';
import Docs from '../../components/dashboard/documents';
import Home from '../../components/dashboard/home';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import Summary from '../../components/dashboard/summary';
import WeekCalendar from '../../components/dashboard/week-calendar';
import ExpandedDocument from '../../components/documents/expand-document';
import ErrorBoundaryComponent from '../../components/error-tracking/error-boundary';
import ExpandedMeeting from '../../components/meeting/expand-meeting';
import BottomNav from '../../components/nav/bottom-nav-bar';
import NavBar from '../../components/nav/nav-bar';
import MeetingPrepNotifications from '../../components/notifications/meeting-prep-notifications';
import NotificationsPopup from '../../components/notifications/notifications-popup';
import ExpandPerson from '../../components/person/expand-person';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import useGapi from '../../components/store/use-gapi';
import getStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';

export const drawerWidth = 240;
export const MOBILE_WIDTH = 700;

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  container: {
    transition: 'background 0.3s',
    background: '#F3F4F6',
  },
  content: {
    overscrollBehavior: 'contain',
    flexGrow: 1,
  },
  center: {
    borderRadius: theme.spacing(2),
    marginTop: theme.spacing(2),
    background: theme.palette.background.paper,
    overflowX: 'auto',
    maxHeight: 'calc(100vh - 104px)',
    position: 'relative',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
      {(process as any).browser && database && isSignedIn && (
        <LoadingStoreDashboardContainer database={database} />
      )}
    </React.Fragment>
  );
};

const LoadingStoreDashboardContainer = (props: { database: any }) => {
  const store = getStore(props.database);
  return (
    <div suppressHydrationWarning={true}>
      <Router basename="/dashboard">
        <ScrollToTop />
        <DashboardContainer store={store} isLoading={store.isLoading} />
      </Router>
    </div>
  );
};

const Nav = (props: { lastUpdated: Date; handleRefreshClick: () => void; isLoading: boolean }) => (
  <React.Fragment>
    <NavBar
      lastUpdated={props.lastUpdated}
      handleRefreshClick={props.handleRefreshClick}
      isLoading={props.isLoading}
    />
    <BottomNav />
  </React.Fragment>
);

interface IProps {
  store: IStore;
  isLoading: boolean;
}

const is500Error = (error: Error) => (error as any).status === 500;

export const DashboardContainer = ({ store, isLoading }: IProps) => {
  const classes = useStyles();
  const handleRefreshClick = () => store.refetch();

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 10); // 10 minutes
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={classes.container}>
      <Head>
        <title>Dashboard - Kelp</title>
      </Head>
      <style jsx global>{`
        html body {
          background-color: #f3f4f6;
        }
      `}</style>
      <Nav
        lastUpdated={store.lastUpdated}
        handleRefreshClick={handleRefreshClick}
        isLoading={isLoading}
      />
      <main className={classes.content}>
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
            <Route path="/summary">
              <Summary {...store} />
            </Route>
            <Route path="/search">
              <Container>
                <Grid container spacing={4} alignItems="flex-start">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <Search {...store} />
                    </div>
                  </Grid>
                </Grid>
              </Container>
            </Route>
            <Route path="/settings">
              <Settings />
            </Route>
            <Route path="/meetings">
              <Container>
                <Grid container spacing={4} alignItems="flex-start">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <Meetings {...store} />
                    </div>
                  </Grid>
                  <Route path="/meetings/:slug">
                    <Grid item xs={12} sm={6}>
                      <div className={classes.center}>
                        <ExpandedMeeting store={store} />
                      </div>
                    </Grid>
                  </Route>
                </Grid>
              </Container>
            </Route>
            <Route path="/docs">
              <Container>
                <Grid container spacing={4} alignItems="flex-start">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <Docs {...store} />
                    </div>
                  </Grid>
                  <Route path="/docs/:slug">
                    <Grid item xs={12} sm={6}>
                      <div className={classes.center}>
                        <ExpandedDocument store={store} />
                      </div>
                    </Grid>
                  </Route>
                </Grid>
              </Container>
            </Route>
            <Route path="/people">
              <Container>
                <Grid container spacing={4} alignItems="flex-start">
                  <Grid item xs={12} sm={6}>
                    <div className={classes.center}>
                      <People {...store} />
                    </div>
                  </Grid>
                  <Route path="/people/:slug">
                    <Grid item xs={12} sm={6}>
                      <div className={classes.center}>
                        <ExpandPerson store={store} />
                      </div>
                    </Grid>
                  </Route>
                </Grid>
              </Container>
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
