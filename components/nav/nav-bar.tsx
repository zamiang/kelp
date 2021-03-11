import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import CloseIcon from '@material-ui/icons/Close';
import DescriptionIcon from '@material-ui/icons/Description';
import EventIcon from '@material-ui/icons/Event';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
    paddingRight: 0,
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

  return (
    <Grid container alignItems="center" justify="space-between">
      <Grid item xs className={clsx(classes.icon, isMeetingsSelected && classes.selected)}>
        <IconButton
          className={classes.iconButtonLarge}
          onClick={() => history.push('/meetings')}
          aria-label="Meetings"
        >
          <EventIcon />
        </IconButton>
      </Grid>
      <Grid item xs className={clsx(classes.icon, isDocsSelected && classes.selected)}>
        <IconButton
          className={classes.iconButtonLarge}
          onClick={() => history.push('/docs')}
          aria-label="Documents"
        >
          <DescriptionIcon />
        </IconButton>
      </Grid>
      <Grid item xs className={clsx(classes.icon, isPeopleSelected && classes.selected)}>
        <IconButton
          className={classes.iconButtonLarge}
          onClick={() => history.push('/people')}
          aria-label="People"
        >
          <AccountCircleIcon />
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
                  onClick={() => (window.location.pathname = '/about')}
                >
                  <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
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
              <CloseIcon />
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
            onClick={() => (window.location.pathname = '/about')}
          >
            <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton onClick={() => setSearchInputVisible(true)}>
            <SearchIcon />
          </IconButton>
        </Grid>
      </Grid>
      <NavBarLayer />
    </header>
  );
};

export default NavBar;
