import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Meetings from './calendar/meetings';
import Copyright from './copyright';
import DocumentList from './docs/document-list';
import LeftDrawer from './nav/left-drawer';
import TopBar from './nav/top-bar';
import People from './person/people';
import Person from './person/person';
import DocDataStore from './store/doc-store';
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
  lastUpdated: Date;
}

export interface IRouteProps extends IProps {
  handlePersonClick: (id: string) => void;
  routeId: string | null;
}

const routes = {
  '/': (props: IRouteProps) => <Meetings {...props} />,
  '/docs': (props: IRouteProps) => <DocumentList {...props} />,
  '/person': (props: IRouteProps) => <Person {...props} />,
  '/people': (props: IRouteProps) => <People {...props} />,
};

interface IRoute {
  path: '/' | '/person' | '/docs' | '/people';
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
  const handlePersonClick = (id: string) => setRoute({ path: '/person', id });
  const handleMeetingsClick = () => setRoute({ path: '/', id: null });
  const handleDocsClick = () => setRoute({ path: '/docs', id: null });

  const routeComponent = routes[currentRoute.path]({
    ...props,
    routeId: currentRoute.id,
    handlePersonClick,
  });

  return (
    <React.Fragment>
      <TopBar handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} />
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
        currentRoute={currentRoute.path}
      />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {routeComponent}
        <Box pt={4}>
          <Copyright />
        </Box>
      </main>
    </React.Fragment>
  );
};

export default Dashboard;
