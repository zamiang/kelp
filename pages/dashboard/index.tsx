import { withAuthenticationRequired } from '@auth0/auth0-react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ExpandedMeeting from '../../components/calendar/expand-meeting';
import Docs from '../../components/dashboard/docs';
import Meetings from '../../components/dashboard/meetings';
import People from '../../components/dashboard/people';
import ExpandedDocument from '../../components/docs/expand-document';
import LeftDrawer from '../../components/nav/left-drawer';
import ExpandPerson from '../../components/person/expand-person';
import panelStyles from '../../components/shared/panel-styles';
import useAccessToken from '../../components/store/use-access-token';
import useStore from '../../components/store/use-store';

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
    color: theme.palette.primary.dark,
  },
}));

const LoadingDashboardContainer = () => {
  const accessToken = useAccessToken();
  const classes = useBackdropStyles();
  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={!accessToken}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {accessToken && <DashboardContainer accessToken={accessToken} />}
    </React.Fragment>
  );
};

interface IProps {
  accessToken: string;
}

const DashboardContainer = ({ accessToken }: IProps) => {
  const store = useStore(accessToken);
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
    meetings: <Meetings {...store} />,
    docs: <Docs {...store} />,
    people: <People {...store} />,
  } as any;

  const expandHash = {
    docs: slug && <ExpandedDocument documentId={slug} {...store} />,
    people: slug && <ExpandPerson personId={slug} {...store} />,
    meetings: slug && <ExpandedMeeting meetingId={slug} {...store} />,
  } as any;

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
        <div className={panelClasses.panel}>
          {store.error && <Alert severity="error">{JSON.stringify(store.error)}</Alert>}
          {tabHash[tab]}
        </div>
        <Drawer
          open={true}
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

export default withAuthenticationRequired(LoadingDashboardContainer);
