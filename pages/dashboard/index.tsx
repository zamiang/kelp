import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Typography } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import onClickOutside from 'react-onclickoutside';
import Docs from '../../components/dashboard/docs';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import Search from '../../components/dashboard/search';
import Summary from '../../components/dashboard/summary';
import WeekCalendar from '../../components/dashboard/week-calendar';
import ExpandedDocument from '../../components/docs/expand-document';
import ExpandedMeeting from '../../components/meeting/expand-meeting';
import LeftDrawer from '../../components/nav/left-drawer';
import ExpandPerson from '../../components/person/expand-person';
import panelStyles from '../../components/shared/panel-styles';
import useGapi from '../../components/store/use-gapi';
import useStore, { IStore } from '../../components/store/use-store';
import Settings from '../../components/user-profile/settings';
import config from '../../constants/config';

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
    borderRadius: `${theme.spacing(2)}px 0 0 ${theme.spacing(2)}px`,
    overscrollBehavior: 'contain',
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
    backgroundColor: config.BLUE_BACKGROUND,
  },
}));

const LoadingDashboardContainer = () => {
  const isSignedIn = useGapi();
  const store = useStore(isSignedIn);
  return (
    <React.Fragment>
      <Loading isOpen={!isSignedIn} message="Loading" />
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

const RightDrawer = (props: {
  shouldRenderPanel: boolean;
  tab: 'docs' | 'people' | 'meetings';
  slug: string;
  store: IStore;
}) => {
  const router = useRouter();
  const isRightDrawerOpen = !!props.slug;
  const panelClasses = panelStyles();
  (RightDrawer as any).handleClickOutside = async () => {
    const tab = new URLSearchParams(window.location.search).get('tab')!;
    return router.push(`?tab=${tab}`);
  };
  const expandHash = {
    docs: props.slug && <ExpandedDocument documentId={props.slug} {...props.store} />,
    people: props.slug && <ExpandPerson personId={props.slug} {...props.store} />,
    meetings: props.slug && <ExpandedMeeting meetingId={props.slug} {...props.store} />,
  } as any;
  return (
    <Drawer
      open={props.shouldRenderPanel && isRightDrawerOpen}
      classes={{
        paper: panelClasses.dockedPanel,
      }}
      anchor="right"
      variant="persistent"
    >
      {expandHash[props.tab]}
    </Drawer>
  );
};

// https://github.com/Pomax/react-onclickoutside/issues/327
RightDrawer.prototype = {};

const clickOutsideConfig = {
  handleClickOutside: () => (RightDrawer as any).handleClickOutside,
};

const OnClickOutsideRightDrawer = onClickOutside(RightDrawer, clickOutsideConfig);

interface IProps {
  store: IStore;
}

const is500Error = (error: Error) => (error as any).status === 500;

export const DashboardContainer = ({ store }: IProps) => {
  const classes = useStyles();
  const panelClasses = panelStyles();
  const handleRefreshClick = () => store.refetch();
  const router = useRouter();
  const slug = router.query.slug as string | null;
  const tab = router.query.tab as string;
  const tabHash = {
    week: <WeekCalendar {...store} />,
    meetings: <Meetings {...store} />,
    docs: <Docs {...store} />,
    people: <People {...store} />,
    summary: <Summary {...store} />,
    settings: <Settings />,
    search: <Search {...store} />,
  } as any;

  const colorHash = {
    week: classes.yellowBackground,
    meetings: classes.blueBackground,
    docs: classes.pinkBackground,
    people: classes.orangeBackground,
    settings: classes.purpleBackground,
    search: classes.purpleBackground,
    summary: classes.blueBackground,
  } as any;

  useEffect(() => {
    const interval = setInterval(store.refetch, 1000 * 60 * 10); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const shouldRenderPanel = !['week', 'summary'].includes(tab);
  return (
    <div className={clsx(classes.container, colorHash[tab])}>
      <LeftDrawer
        lastUpdated={store.lastUpdated}
        people={store.personDataStore.getPeople()}
        documents={store.docDataStore.getDocs()}
        meetings={store.timeDataStore.getSegments()}
        handleRefreshClick={handleRefreshClick}
        tab={tab as any}
      />
      <main className={classes.content}>
        {shouldRenderPanel && (
          <div className={panelClasses.panel}>
            {store.error && !is500Error(store.error) && (
              <Alert severity="error">{JSON.stringify(store.error)}</Alert>
            )}
            {tabHash[tab]}
          </div>
        )}
        {!shouldRenderPanel && tabHash[tab]}
        <OnClickOutsideRightDrawer
          store={store}
          shouldRenderPanel={shouldRenderPanel}
          slug={slug as any}
          tab={tab as any}
        />
      </main>
    </div>
  );
};

export default withAuthenticationRequired(LoadingDashboardContainer, {
  onRedirecting: () => <Loading isOpen={true} message="Authenticating" />,
});
