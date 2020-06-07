import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React, { useState } from 'react';
import Meetings from './calendar/meetings';
import Copyright from './copyright';
import DocumentList from './docs/document-list';
import LeftDrawer from './nav/left-drawer';
import TopBar from './nav/top-bar';
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
  },
}));

export interface IProps {
  personDataStore: PersonDataStore;
  timeDataStore: TimeDataStore;
  docDataStore: DocDataStore;
  lastUpdated: Date;
}

const routes = {
  '/': (props: IProps) => <Meetings {...props} />,
  '/docs': (props: IProps) => <DocumentList {...props} />,
  '/person': (props: IProps, id: string | null) => <Person {...props} personEmail={id!} />,
};

interface IRoute {
  path: '/' | '/person' | '/docs';
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

  const handlePersonClick = (id: string) => setRoute({ path: '/person', id });
  const handleMeetingsClick = () => setRoute({ path: '/', id: null });
  const handleDocsClick = () => setRoute({ path: '/docs', id: null });

  const routeComponent = routes[currentRoute.path](props, currentRoute.id);

  return (
    <React.Fragment>
      <TopBar handleDrawerOpen={handleDrawerOpen} isOpen={isOpen} lastUpdated={props.lastUpdated} />
      <LeftDrawer
        handleDocsClick={handleDocsClick}
        handleDrawerClose={handleDrawerClose}
        isOpen={isOpen}
        people={props.personDataStore.getPeople()}
        handlePersonClick={handlePersonClick}
        handleMeetingsClick={handleMeetingsClick}
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
