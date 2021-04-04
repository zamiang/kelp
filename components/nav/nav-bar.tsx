import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CalendarOrangeIcon from '../../public/icons/calendar-orange.svg';
import CalendarIcon from '../../public/icons/calendar.svg';
import BackIcon from '../../public/icons/close.svg';
import FileOrangeIcon from '../../public/icons/file-orange.svg';
import FileIcon from '../../public/icons/file.svg';
import SearchIcon from '../../public/icons/search.svg';
import TasksOrangeIcon from '../../public/icons/tasks-orange.svg';
import TasksIcon from '../../public/icons/tasks.svg';
import UserOrangeIcon from '../../public/icons/user-orange.svg';
import UserIcon from '../../public/icons/user.svg';
import SearchBar from './search-bar';

const useStyles = makeStyles((theme) => ({
  container: {
    border: '0px',
    position: 'sticky',
    top: 0,
    left: 0,
    borderBottom: `1px solid ${theme.palette.divider}`,
    zIndex: 6,
    justifyContent: 'space-between',
    background: theme.palette.background.paper,
  },
  border: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingRight: theme.spacing(2),
  },
  selected: {
    color: `${theme.palette.secondary.dark} !important`,
    borderBottom: `1px solid ${theme.palette.primary.main} !important`,
  },
  icon: {
    color: theme.palette.secondary.light,
    transition: 'border-color 0.6s',
    textAlign: 'center',
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
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
}));

const NavBarLayer = () => {
  const classes = useStyles();
  const router = useLocation();
  const history = useHistory();

  const tab = router.pathname;
  const isMeetingsSelected = tab.includes('meetings');
  const isDocsSelected = tab.includes('docs');
  const isPeopleSelected = tab.includes('people');
  const isTasksSelected = tab.includes('tasks');

  return (
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
          onClick={() => history.push('/docs')}
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
  );
};

const NavBar = () => {
  const classes = useStyles();
  const history = useHistory();
  const router = useLocation();

  const hasSearchParams = router.search.length > 0;

  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(hasSearchParams);

  if (isSearchInputVisible) {
    return (
      <header className={classes.container}>
        <Grid container alignItems="center" justify="space-between" className={classes.border}>
          <Grid item>
            <Grid container alignItems="center">
              <Grid item>
                <IconButton
                  className={classes.iconButton}
                  onClick={() => {
                    history.push('/meetings');
                  }}
                >
                  <img
                    width="24"
                    height="24"
                    className={classes.logo}
                    src="/kelp.svg"
                    alt="Kelp logo"
                  />
                </IconButton>
              </Grid>
              <Grid item>
                <SearchBar />
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => {
                history.push('/meetings');
                setSearchInputVisible(false);
              }}
            >
              <BackIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
        <NavBarLayer />
      </header>
    );
  }

  return (
    <header className={classes.container}>
      <Grid container alignItems="center" className={classes.border}>
        <Grid item>
          <IconButton
            className={classes.iconButton}
            onClick={() => {
              history.push('/meetings');
            }}
          >
            <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setSearchInputVisible(true)}>
            <SearchIcon width="24" height="24" />
          </IconButton>
        </Grid>
      </Grid>
      <NavBarLayer />
    </header>
  );
};

export default NavBar;
