import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import clsx from 'clsx';
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
import ExpandPerson from '../../components/person/expand-person';
import ChromeExtensionPopup from '../../components/shared/chrome-extension-popup';
import Loading from '../../components/shared/loading';
import db from '../../components/store/db';
import getStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';

export const drawerWidth = 240;
export const MOBILE_WIDTH = 700;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    overscrollBehavior: 'contain',
    overscrollBehaviorY: 'none',
    overscrollBehaviorX: 'none',
    flexGrow: 1,
    background: theme.palette.secondary.light,
    minHeight: '100vh',
  },
  left: {
    maxWidth: 440,
    minHeight: '100vh',
    background: theme.palette.background.paper,
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
    marginBottom: theme.spacing(4),
    borderRadius: theme.spacing(1),
    background: theme.palette.background.paper,
    maxWidth: 530,
    position: 'relative',
    maxHeight: 'calc(100vh - 66px)',
    overflow: 'auto',
    width: '100%',
  },
  fullWidth: {
    maxWidth: '90%',
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
        <DashboardContainer store={store} />
      </Router>
    </div>
  );
};

export const DesktopDashboard = (props: { store: IStore }) => {
  const history = useHistory();
  const classes = useStyles();
  const store = props.store;

  // Used to render default panels for index pages
  const [meetingId, setMeetingId] = useState<string | undefined>(undefined);
  const [personId, setPersonId] = useState<string | undefined>(undefined);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);

  const handleRefreshClick = () => store.refetch();
  const pathname = useLocation().pathname;

  // Unsure why the <Redirect component doesn't work anymore
  if (pathname === '/') {
    history.push(`/meetings`);
  }
  const shouldBeFullWidth =
    pathname.includes('/dashboard') || pathname.includes('/week') || pathname.includes('/summary');

  return (
    <ErrorBoundaryComponent>
      <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>Please reload the page
          <Typography>{store.error}</Typography>
        </Alert>
      </Dialog>
      <ChromeExtensionPopup />
      <main className={classes.content}>
        <Switch>
          <Grid container alignItems="flex-start">
            <Grid item className={classes.left}>
              <NavBar />
              <Route path="/search">
                <Search store={store} />
              </Route>
              <Route path="/meetings">
                <Meetings store={store} setMeetingId={setMeetingId} />
              </Route>
              <Route path="/docs">
                <Docs store={store} setDocumentId={setDocumentId} />
              </Route>
              <Route path="/people">
                <People store={store} setPersonId={setPersonId} />
              </Route>
            </Grid>
            <Grid item xs className={clsx(classes.right)}>
              <NavRight handleRefreshClick={handleRefreshClick} store={store} />
              <div className={clsx(classes.center, shouldBeFullWidth && classes.fullWidth)}>
                <Route exact path="/meetings">
                  <ExpandedMeeting store={store} meetingId={meetingId} />
                </Route>
                <Route exact path="/docs">
                  <ExpandedDocument store={store} documentId={documentId} />
                </Route>
                <Route exact path="/people">
                  <ExpandPerson store={store} personId={personId} />
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
                <Route path="/settings">
                  <Settings />
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
      </Head>
      {isMobile ? <MobileDashboard store={store} /> : <DesktopDashboard store={store} />}
    </div>
  );
};

export default LoadingDashboardContainer;
