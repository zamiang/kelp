import { withAuthenticationRequired } from '@auth0/auth0-react';
import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, { ReactNode, useState } from 'react';
import ExpandedMeeting from '../calendar/expand-meeting';
import ExpandedDocument from '../docs/expand-document';
import LeftDrawer from '../nav/left-drawer';
import ExpandPerson from '../person/expand-person';
import panelStyles from '../shared/panel-styles';
import DocDataStore from '../store/doc-store';
import DriveActivityDataStore from '../store/drive-activity-store';
import EmailDataStore from '../store/email-store';
import PersonDataStore from '../store/person-store';
import TimeDataStore from '../store/time-store';
import withStore from '../store/with-store';

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

export interface IProps {
  personDataStore: PersonDataStore;
  timeDataStore: TimeDataStore;
  docDataStore: DocDataStore;
  driveActivityStore: DriveActivityDataStore;
  emailStore: EmailDataStore;
  lastUpdated: Date;
  refetch: () => void;
}

// Note: Lots more info on this object but is unused by the app
/*
const getInitialGoogleState = () =>
  gapi && gapi.auth && gapi.auth.getToken()
    ? { accessToken: gapi.auth.getToken().access_token }
    : { accessToken: '' };

    const [googleLoginState, setGoogleLoginState] = useState(getInitialGoogleState());
*/

interface IDashboardProps {
  children?: ReactNode;
}

const Dashboard = (props: IDashboardProps) => {
  console.log(props, '<<<<<<<<<<<<<<');
  const classes = useStyles();
  const panelClasses = panelStyles();
  const [isOpen, setOpen] = useState(true);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleRefreshClick = () => props.refetch();
  // todo
  const slug = useRouter().pathname;

  // <TopBar handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} /> --!>
  // add above route component <div className={classes.appBarSpacer} />
  return (
    <React.Fragment>
      <LeftDrawer
        lastUpdated={props.lastUpdated}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={props.personDataStore.getPeople()}
        documents={props.docDataStore.getDocs()}
        meetings={props.timeDataStore.getSegments()}
        handleDrawerOpen={handleDrawerOpen}
        handleRefreshClick={handleRefreshClick}
      />
      <main className={classes.content}>
        <div className={panelClasses.panel}>{props.children}</div>
        <Drawer
          open={true}
          classes={{
            paper: panelClasses.dockedPanel,
          }}
          anchor="right"
          variant="persistent"
        >
          <ExpandedDocument documentId={slug} {...props} />
          <ExpandPerson personId={slug} {...props} />
          <ExpandedMeeting meetingId={slug} {...props} />
        </Drawer>
      </main>
    </React.Fragment>
  );
};

export default withAuthenticationRequired(withStore(Dashboard));
