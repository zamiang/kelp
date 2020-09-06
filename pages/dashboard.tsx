import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import ExpandedMeeting from '../components/calendar/expand-meeting';
import Meetings from '../components/calendar/meetings';
import DocumentList from '../components/docs/document-list';
import ExpandedDocument from '../components/docs/expand-document';
import LeftDrawer from '../components/nav/left-drawer';
import ExpandPerson from '../components/person/expand-person';
import People from '../components/person/people';
import panelStyles from '../components/shared/panel-styles';
import DocDataStore from '../components/store/doc-store';
import DriveActivityDataStore from '../components/store/drive-activity-store';
import EmailDataStore from '../components/store/email-store';
import PersonDataStore from '../components/store/person-store';
import TimeDataStore from '../components/store/time-store';

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

interface IMatch {
  match: {
    params: {
      slug: string;
    };
  };
}

// Note: Lots more info on this object but is unused by the app
const getInitialGoogleState = () =>
  gapi && gapi.auth && gapi.auth.getToken()
    ? { accessToken: gapi.auth.getToken().access_token }
    : { accessToken: '' };

const loadLibraries = () =>
  gapi.client.init({
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
      'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    ],
  });

// load libraries is callback style
gapi.load('client', loadLibraries as any);

const Dashboard = (props: IProps) => {
  const [googleLoginState, setGoogleLoginState] = useState(getInitialGoogleState());

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
        <div className={panelClasses.panel}>
          <Switch>
            <Route path="/dashboard/docs" component={() => <DocumentList {...props} />} />
            <Route path="/dashboard/people" component={() => <People {...props} />} />
            <Route path="/dashboard/meetings" component={() => <Meetings {...props} />} />
          </Switch>
        </div>
        <Drawer
          open={true}
          classes={{
            paper: panelClasses.dockedPanel,
          }}
          anchor="right"
          variant="persistent"
        >
          <Route
            path="/dashboard/docs/:slug"
            component={({ match }: IMatch) => (
              <ExpandedDocument documentId={match.params.slug} {...props} />
            )}
          />
          <Route
            path="/dashboard/people/:slug"
            component={({ match }: IMatch) => (
              <ExpandPerson personId={match.params.slug} {...props} />
            )}
          />
          <Route
            path="/dashboard/meetings/:slug"
            component={({ match }: IMatch) => (
              <ExpandedMeeting meetingId={match.params.slug} {...props} />
            )}
          />
        </Drawer>
      </main>
    </React.Fragment>
  );
};

export default Dashboard;
