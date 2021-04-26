import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Documents from '../dashboard/documents';
import Home from '../dashboard/home';
import Meetings from '../dashboard/meetings';
import People from '../dashboard/people';
import Search from '../dashboard/search';
import Tasks from '../dashboard/tasks';
import ExpandedDocument from '../documents/expand-document';
import ExpandedMeeting from '../meeting/expand-meeting';
import ExpandPerson from '../person/expand-person';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';
import ExpandedTask from '../tasks/expand-task';
import Settings from '../user-profile/settings';
import Handle404 from './handle-404';
import PopupHeader from './popup-header';

const useInfoStyles = makeStyles((theme) => ({
  homeRow: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  box: {
    background: '#fff',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  content: {
    overscrollBehavior: 'contain',
    overscrollBehaviorY: 'none',
    overscrollBehaviorX: 'none',
    background: 'linear-gradient(90deg, hsla(150, 60%, 98%, 1) 0%, hsla(40, 60%, 95%, 1) 100%)',
    minHeight: '100vh',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    overflow: 'hidden',
  },
  container: {
    position: 'relative',
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.paper,
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    textAlign: 'center',
    zIndex: 15,
  },
  icon: {
    color: theme.palette.secondary.light,
    transition: 'border-color 0.6s',
    textAlign: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderBottom: 0,
  },
  iconButton: {
    borderRadius: 0,
    width: '100%',
    paddingBottom: 10,
  },
  iconButtonLarge: {
    borderRadius: 0,
    width: '100%',
    padding: 20,
  },
  selected: {
    color: `${theme.palette.secondary.dark} !important`,
  },
  bottom: {
    position: 'fixed',
    borderTop: `1px solid ${theme.palette.divider}`,
    bottom: 0,
    left: 0,
    width: '100vw',
    background: theme.palette.background.paper,
  },
}));

const MobileDashboard = (props: { store: IStore }) => {
  const store = props.store;
  const classes = useInfoStyles();
  const [user, setUser] = useState<IPerson | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      const user = await store.personDataStore.getSelf();
      if (user) {
        setUser(user);
      }
    };
    void fetchData();
  }, [store.isLoading]);

  return (
    <div className={classes.content}>
      <PopupHeader user={user} store={store} />
      <div className={classes.container}>
        <Switch>
          <Route path="/search">
            <Search store={store} />
          </Route>
          <Route path="/home">
            <Home store={store} />
          </Route>
          <Route path="/people/:slug">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <ExpandPerson store={store} />
            </Box>
          </Route>
          <Route path="/documents/:slug">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <ExpandedDocument store={store} />
            </Box>
          </Route>
          <Route path="/meetings/:slug">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <ExpandedMeeting store={store} />
            </Box>
          </Route>
          <Route path="/tasks/:slug">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <ExpandedTask store={store} />
            </Box>
          </Route>
          <Route path="/meetings">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <Meetings store={store} />
            </Box>
          </Route>
          <Route path="/people">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <People store={store} />
            </Box>
          </Route>
          <Route path="/tasks">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <Tasks store={store} />
            </Box>
          </Route>
          <Route path="/documents">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <Documents store={store} />
            </Box>
          </Route>
          <Route path="/settings">
            <Box className={classes.box} boxShadow={3} borderRadius={8}>
              <Settings />
            </Box>
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
          <Route>
            <Handle404 />
          </Route>
        </Switch>
      </div>
    </div>
  );
};
export default MobileDashboard;