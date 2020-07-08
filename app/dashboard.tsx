import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Meetings from './calendar/meetings';
import DocumentList from './docs/document-list';
import LeftDrawer from './nav/left-drawer';
// import TopBar from './nav/top-bar';
import People from './person/people';
import DocDataStore from './store/doc-store';
import DriveActivityDataStore from './store/drive-activity-store';
import EmailDataStore from './store/email-store';
import PersonDataStore from './store/person-store';
import TimeDataStore from './store/time-store';

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

export interface IRouteProps extends IProps {
  handlePersonClick: (id?: string) => void;
  routeId: string | null;
}

const routes = {
  '/': (props: IRouteProps) => <Meetings {...props} />,
  '/docs': (props: IRouteProps) => <DocumentList {...props} />,
  '/people': (props: IRouteProps) => <People {...props} />,
};

interface IRoute {
  path: '/' | '/docs' | '/people';
  id: string | null;
}

const Dashboard = (props: IProps) => {
  const classes = useStyles();
  const [isOpen, setOpen] = useState(true);
  const [currentRoute, setRoute] = useState<IRoute>({ path: '/', id: null });
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handlePeopleClick = () => setRoute({ path: '/people', id: null });
  const handlePersonClick = (id?: string) => id && setRoute({ path: '/people', id });
  const handleMeetingsClick = () => setRoute({ path: '/', id: null });
  const handleDocsClick = () => setRoute({ path: '/docs', id: null });

  const handleRefreshClick = () => props.refetch();

  const routeComponent = routes[currentRoute.path]({
    ...props,
    routeId: currentRoute.id,
    handlePersonClick,
  });
  // <TopBar handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} /> --!>
  // add above route component <div className={classes.appBarSpacer} />
  return (
    <React.Fragment>
      <LeftDrawer
        lastUpdated={props.lastUpdated}
        handleDocsClick={handleDocsClick}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={props.personDataStore.getPeople()}
        documents={props.docDataStore.getDocs()}
        meetings={props.timeDataStore.getSegments()}
        handlePeopleClick={handlePeopleClick}
        handlePersonClick={handlePersonClick}
        handleMeetingsClick={handleMeetingsClick}
        handleDrawerOpen={handleDrawerOpen}
        handleRefreshClick={handleRefreshClick}
        currentRoute={currentRoute.path}
      />
      <main className={classes.content}>{routeComponent}</main>
    </React.Fragment>
  );
};

export default Dashboard;
