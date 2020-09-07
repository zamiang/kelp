import { withAuthenticationRequired } from '@auth0/auth0-react';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
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
import useStore from '../../components/store/use-store';
// import TopBar from './nav/top-bar';

export const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
    background: 'white',
  },
}));

// Note: Lots more info on this object but is unused by the app
/*
const getInitialGoogleState = () =>
  gapi && gapi.auth && gapi.auth.getToken()
    ? { accessToken: gapi.auth.getToken().access_token }
    : { accessToken: '' };

    const [googleLoginState, setGoogleLoginState] = useState(getInitialGoogleState());
*/

const DashboardContainer = () => {
  const store = useStore();
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
    <React.Fragment>
      <LeftDrawer
        lastUpdated={store.lastUpdated}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={store.personDataStore.getPeople()}
        documents={store.docDataStore.getDocs()}
        meetings={store.timeDataStore.getSegments()}
        handleDrawerOpen={handleDrawerOpen}
        handleRefreshClick={handleRefreshClick}
      />
      <main className={classes.content}>
        <div className={panelClasses.panel}>{tabHash[tab]}</div>
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
    </React.Fragment>
  );
};

export default withAuthenticationRequired(DashboardContainer);
