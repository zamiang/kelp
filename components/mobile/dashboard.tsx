import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import Documents from '../dashboard/documents';
import Meetings from '../dashboard/meetings';
import People from '../dashboard/people';
import Search from '../dashboard/search';
import ExpandedDocument from '../documents/expand-document';
import ExpandedMeeting from '../meeting/expand-meeting';
import ExpandPerson from '../person/expand-person';
import { IPerson } from '../store/models/person-model';
import { IStore } from '../store/use-store';
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
    maxHeight: 'calc(100vh - 119px)',
    overflowY: 'auto',
    background: theme.palette.background.paper,
    overflowX: 'hidden',
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
}));

const MobileDashboard = (props: { store: IStore }) => {
  const store = props.store;
  const classes = useInfoStyles();
  const history = useHistory();
  const location = useLocation();
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

  const currentTab = location.pathname.split('/')[1];

  return (
    <div>
      <PopupHeader user={user} store={store} />
      <div className={classes.container}>
        <Switch>
          <Route path="/search/docs/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/search/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/search/people/:slug">
            <ExpandPerson store={store} />
          </Route>
          <Route path="/search">
            <Search store={store} />
          </Route>
          <Route path="/people/:slug">
            <ExpandPerson store={store} />
          </Route>
          <Route path="/docs/:slug">
            <ExpandedDocument store={store} />
          </Route>
          <Route path="/meetings/:slug">
            <ExpandedMeeting store={store} />
          </Route>
          <Route path="/meetings">
            <Meetings store={store} />
          </Route>
          <Route path="/people">
            <People hideHeading store={store} />
          </Route>
          <Route path="/documents">
            <Documents hideHeading store={store} />
          </Route>
          <Route path="/settings">
            <Settings shouldRenderHeader={false} />
          </Route>
          <Route exact path="/">
            <Redirect to="/meetings" />
          </Route>
          <Route>
            <Handle404 />
          </Route>
        </Switch>
      </div>
      <BottomNavigation
        onChange={(_event, value) => history.push(`/${value}`)}
        className={classes.footer}
        value={currentTab}
      >
        <BottomNavigationAction
          showLabel={false}
          label="Meetings"
          value="meetings"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          showLabel={false}
          label="Documents"
          value="documents"
          icon={<InsertDriveFileIcon />}
        />
        <BottomNavigationAction
          showLabel={false}
          label="People"
          value="people"
          icon={<GroupIcon />}
        />
      </BottomNavigation>
    </div>
  );
};
export default MobileDashboard;
