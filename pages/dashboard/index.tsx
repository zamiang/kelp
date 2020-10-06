import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Typography } from '@material-ui/core';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import WeekCalendar from '../../components/calendar/week-calendar';
import Docs from '../../components/dashboard/docs';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import ExpandedDocument from '../../components/docs/expand-document';
import ExpandedMeeting from '../../components/meeting/expand-meeting';
import LeftDrawer from '../../components/nav/left-drawer';
import ExpandPerson from '../../components/person/expand-person';
import panelStyles from '../../components/shared/panel-styles';
import useAccessToken from '../../components/store/use-access-token';
import useStore, { IStore } from '../../components/store/use-store';

export const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  container: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    background: 'white',
  },
}));

const useBackdropStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const LoadingDashboardContainer = () => {
  const accessToken = useAccessToken();
  const store = useStore(accessToken || '');
  return (
    <React.Fragment>
      <Loading isOpen={!accessToken} message="Loading" />
      {accessToken && <DashboardContainer store={store} />}
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

export const DashboardContainer = ({ store }: IProps) => {
  const classes = useStyles();
  const panelClasses = panelStyles();
  const [isOpen, setOpen] = useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleRefreshClick = () => store.refetch();
  // todo
  const slug = useRouter().query.slug as string | null;
  const tab = useRouter().query.tab as string;

  const tabHash = {
    week: <WeekCalendar {...store} />,
    meetings: <Meetings {...store} />,
    docs: <Docs {...store} />,
    people: <People {...store} />,
  } as any;

  const expandHash = {
    docs: slug && <ExpandedDocument documentId={slug} {...store} />,
    people: slug && <ExpandPerson personId={slug} {...store} />,
    meetings: slug && <ExpandedMeeting meetingId={slug} {...store} />,
  } as any;

  const isDrawerOpen = tab !== 'week';
  // <TopBar handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} /> --!>
  // add above route component <div className={classes.appBarSpacer} />
  return (
    <div className={classes.container}>
      <LeftDrawer
        lastUpdated={store.lastUpdated}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={store.personDataStore.getPeople()}
        documents={store.docDataStore.getDocs()}
        meetings={store.timeDataStore.getSegments()}
        handleDrawerOpen={handleDrawerOpen}
        handleRefreshClick={handleRefreshClick}
        tab={tab as any}
      />
      <main className={classes.content}>
        {isDrawerOpen && (
          <div className={panelClasses.panel}>
            {store.error && <Alert severity="error">{JSON.stringify(store.error)}</Alert>}
            {tabHash[tab]}
          </div>
        )}
        {!isDrawerOpen && tabHash[tab]}
        <Drawer
          open={isDrawerOpen}
          classes={{
            paper: panelClasses.dockedPanel,
          }}
          anchor="right"
          variant="persistent"
        >
          {expandHash[tab]}
        </Drawer>
      </main>
    </div>
  );
};

export default withAuthenticationRequired(LoadingDashboardContainer, {
  onRedirecting: () => <Loading isOpen={true} message="Authenticating" />,
});
