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
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Docs from '../../components/dashboard/documents';
import Home from '../../components/dashboard/home';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import Summary from '../../components/dashboard/summary';
import WeekCalendar from '../../components/dashboard/week-calendar';
import ErrorBoundaryComponent from '../../components/error-tracking/error-boundary';
import LeftDrawer from '../../components/nav/left-drawer';
import MeetingPrepNotifications from '../../components/notifications/meeting-prep-notifications';
import NotificationsPopup from '../../components/notifications/notifications-popup';
import useGapi from '../../components/store/use-gapi';
import useStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';
import config from '../../constants/config';
import { bodyFontFamily } from '../../constants/theme';

export const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  container: {
    display: 'flex',
    transition: 'background 0.3s',
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    background: 'white',
    overscrollBehavior: 'contain',
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
  const router = useRouter();
  const [session, isLoading] = useSession();
  const store = useStore(isSignedIn);

  if (!isLoading && !session?.user) {
    void router.push('/');
  }

  return (
    <React.Fragment>
      <Loading isOpen={!isSignedIn || isLoading} message="Loading" />
      {isSignedIn && <DashboardContainer store={store} />}
    </React.Fragment>
  );
};

const Loading = (props: { isOpen: boolean; message: string }) => {
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

interface IProps {
  store: IStore;
}

const is500Error = (error: Error) => (error as any).status === 500;

const globalStyles = `
line {
  stroke: #ccc;
}
text {
  text-anchor: middle;
  font-family: ${bodyFontFamily};
  fill: #B8B8B8;
  font-size: 0.8125rem;
}
.document circle {
  fill: #747C81;
}
.meeting circle {
  fill: #747C81;
}
.person circle {
  fill: #747C81;
}
.node:not(:hover) .nodetext {
  display: none;
}
.node {
  position: relative;
}
.tick text, .nodetext {
  fill: #747C81;
}
.avatar {
  fill: #fff;
  font-weight: bold;
}
.domain {
  display: none;
}
`;

export const DashboardContainer = ({ store }: IProps) => {
  const classes = useStyles();
  const handleRefreshClick = () => store.refetch();
  const router = useRouter();
  const tab = router.query.tab as string;
  const tabHash = {
    week: <WeekCalendar {...store} />,
    meetings: <Meetings {...store} />,
    docs: <Docs {...store} />,
    people: <People {...store} />,
    summary: <Summary {...store} />,
    settings: <Settings />,
    search: <Search {...store} />,
    home: <Home {...store} />,
  } as any;

  const colorHash = {
    week: classes.grayBackground,
    summary: classes.grayBackground,
    search: classes.grayBackground,
    settings: classes.grayBackground,
    meetings: classes.blueBackground,
    docs: classes.pinkBackground,
    people: classes.orangeBackground,
    home: classes.grayBackground,
  } as any;

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 10); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
  }, []);
  return (
    <div className={clsx(classes.container, colorHash[tab])}>
      <Head>
        <title>Dashboard - Kelp</title>
      </Head>
      <style>{globalStyles}</style>
      <LeftDrawer
        lastUpdated={store.lastUpdated}
        handleRefreshClick={handleRefreshClick}
        tab={tab as any}
      />
      <main className={classes.content}>
        <Dialog maxWidth="md" open={store.error && !is500Error(store.error) ? true : false}>
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>Please reload the page
          </Alert>
        </Dialog>
        <NotificationsPopup />
        <MeetingPrepNotifications {...store} />
        <ErrorBoundaryComponent>{tabHash[tab]}</ErrorBoundaryComponent>
      </main>
    </div>
  );
};

export default LoadingDashboardContainer;
