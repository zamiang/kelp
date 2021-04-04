import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import CalendarOrangeIcon from '../../public/icons/calendar-orange.svg';
import CalendarIcon from '../../public/icons/calendar.svg';
import TasksOrangeIcon from '../../public/icons/check-orange.svg';
import TasksIcon from '../../public/icons/check.svg';
import FileOrangeIcon from '../../public/icons/file-orange.svg';
import FileIcon from '../../public/icons/file.svg';
import UserOrangeIcon from '../../public/icons/user-orange.svg';
import UserIcon from '../../public/icons/user.svg';
import Documents from '../dashboard/documents';
import Meetings from '../dashboard/meetings';
import People from '../dashboard/people';
import Search from '../dashboard/search';
import Tasks from '../dashboard/tasks';
import ExpandedDocument from '../documents/expand-document';
import ExpandedMeeting from '../meeting/expand-meeting';
import ExpandPerson from '../person/expand-person';
import { IPerson } from '../store/models/person-model';
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
  const history = useHistory();
  const location = useLocation();
  const [user, setUser] = useState<IPerson | undefined>(undefined);

  const tab = location.pathname;
  const isMeetingsSelected = tab.includes('meetings');
  const isDocsSelected = tab.includes('documents');
  const isPeopleSelected = tab.includes('people');
  const isTasksSelected = tab.includes('tasks');

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
      <div className={classes.bottom}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item xs className={clsx(classes.icon, isMeetingsSelected && classes.selected)}>
            <IconButton
              className={classes.iconButtonLarge}
              onClick={() => history.push('/meetings')}
              aria-label="Meetings"
            >
              {isMeetingsSelected ? (
                <CalendarOrangeIcon width="24" height="24" />
              ) : (
                <CalendarIcon width="24" height="24" />
              )}
            </IconButton>
          </Grid>
          <Grid item xs className={clsx(classes.icon, isDocsSelected && classes.selected)}>
            <IconButton
              className={classes.iconButtonLarge}
              onClick={() => history.push('/documents')}
              aria-label="Documents"
            >
              {isDocsSelected ? (
                <FileOrangeIcon width="24" height="24" />
              ) : (
                <FileIcon width="24" height="24" />
              )}
            </IconButton>
          </Grid>
          <Grid item xs className={clsx(classes.icon, isPeopleSelected && classes.selected)}>
            <IconButton
              className={classes.iconButtonLarge}
              onClick={() => history.push('/people')}
              aria-label="People"
            >
              {isPeopleSelected ? (
                <UserOrangeIcon width="24" height="24" />
              ) : (
                <UserIcon width="24" height="24" />
              )}
            </IconButton>
          </Grid>
          <Grid item xs className={clsx(classes.icon, isTasksSelected && classes.selected)}>
            <IconButton
              className={classes.iconButtonLarge}
              onClick={() => history.push('/tasks')}
              aria-label="Tasks"
            >
              {isTasksSelected ? (
                <TasksOrangeIcon width="24" height="24" />
              ) : (
                <TasksIcon width="24" height="24" />
              )}
            </IconButton>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
export default MobileDashboard;
