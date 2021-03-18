import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import CalendarIcon from '../../public/icons/calendar.svg';
import FileIcon from '../../public/icons/file.svg';
import UserIcon from '../../public/icons/user.svg';
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
            <People store={store} />
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
      <BottomNavigation
        onChange={(_event, value) => history.push(`/${value}`)}
        className={classes.footer}
        value={currentTab}
      >
        <BottomNavigationAction
          value="meetings"
          showLabel={false}
          icon={<CalendarIcon width="24" height="24" />}
        />
        <BottomNavigationAction
          value="documents"
          showLabel={false}
          icon={<FileIcon width="24" height="24" />}
        />
        <BottomNavigationAction
          value="people"
          showLabel={false}
          icon={<UserIcon width="24" height="24" />}
        />
      </BottomNavigation>
    </div>
  );
};
export default MobileDashboard;
