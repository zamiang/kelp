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
  container: {
    position: 'relative',
    overflowY: 'auto',
    background: theme.palette.background.paper,
    overflowX: 'hidden',
    paddingBottom: 110,
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
    <div>
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
            <ExpandPerson store={store} />
          </Route>
          <Route path="/documents/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/tasks/:slug">
            <ExpandedTask store={store} />
          </Route>
          <Route path="/meetings">
            <Meetings store={store} />
          </Route>
          <Route path="/people">
            <People store={store} />
          </Route>
          <Route path="/tasks">
            <Tasks store={store} />
          </Route>
          <Route path="/documents">
            <Documents store={store} />
          </Route>
          <Route path="/settings">
            <Settings />
          </Route>
          <Route exact path="/">
            <Redirect to="/meetings" />
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
