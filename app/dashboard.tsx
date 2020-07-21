import Drawer from '@material-ui/core/Drawer';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import ExpandedMeeting from './calendar/expand-meeting';
import Meetings from './calendar/meetings';
import DocumentList from './docs/document-list';
import ExpandedDocument from './docs/expand-document';
import LeftDrawer from './nav/left-drawer';
import ExpandPerson from './person/expand-person';
import People from './person/people';
import panelStyles from './shared/panel-styles';
import DocDataStore from './store/doc-store';
import DriveActivityDataStore from './store/drive-activity-store';
import EmailDataStore from './store/email-store';
import PersonDataStore from './store/person-store';
import TimeDataStore from './store/time-store';

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

const Dashboard = (props: IProps) => {
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
            path="/dashboard/docs/:documentId"
            component={() => <ExpandedDocument {...props} />}
          />
          <Route path="/dashboard/people/:personId" component={() => <ExpandPerson {...props} />} />
          <Route
            path="/dashboard/meetings/:meetingId"
            component={() => <ExpandedMeeting {...props} />}
          />
        </Drawer>
      </main>
    </React.Fragment>
  );
};

export default Dashboard;
