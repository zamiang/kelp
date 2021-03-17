import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
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
  },
  iconButtonLarge: {
    borderRadius: 0,
    width: '100%',
    padding: 10,
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
          <img width="44" src="/icons/calendar.svg" />
        </IconButton>
      </Grid>
      <Grid item xs className={clsx(classes.icon, isDocsSelected && classes.selected)}>
        <IconButton
          className={classes.iconButtonLarge}
          onClick={() => history.push('/docs')}
          aria-label="Documents"
        >
          <img width="44" src="/icons/file.svg" />
        </IconButton>
      </Grid>
      <Grid item xs className={clsx(classes.icon, isPeopleSelected && classes.selected)}>
        <IconButton
          className={classes.iconButtonLarge}
          onClick={() => history.push('/people')}
          aria-label="People"
        >
          <img width="44" src="/icons/user.svg" />
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
              <img width="24" height="24" src="/icons/back.svg" />
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
            <img width="24" height="24" src="/icons/search.svg" />
          </IconButton>
        </Grid>
      </Grid>
      <NavBarLayer />
    </header>
  );
};

export default NavBar;
