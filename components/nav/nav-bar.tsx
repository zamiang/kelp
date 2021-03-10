import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import clsx from 'clsx';
import React from 'react';
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
  },
  selected: {
    color: `${theme.palette.secondary.dark} !important`,
    borderBottom: `3px solid ${theme.palette.primary.main} !important`,
  },
  icon: {
    color: theme.palette.secondary.light,
    transition: 'border-color 0.6s',
    textAlign: 'center',
    borderBottom: `3px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `3px solid ${theme.palette.divider}`,
    },
  },
  logo: {
    width: 24,
    height: 24,
    borderBottom: 0,
  },
  iconButton: {
    borderRadius: 0,
    width: '100%',
    paddingBottom: 10,
  },
}));

const NavBar = () => {
  const classes = useStyles();
  const router = useLocation();
  const history = useHistory();

  const tab = router.pathname;
  const isMeetingsSelected = tab.includes('meetings');
  const isDocsSelected = tab.includes('docs');
  const isPeopleSelected = tab.includes('people');

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
          <SearchBar />
        </Grid>
      </Grid>
      <Grid container alignItems="center" justify="space-between">
        <Grid item xs className={clsx(classes.icon, isMeetingsSelected && classes.selected)}>
          <IconButton
            className={classes.iconButton}
            onClick={() => history.push('/meetings')}
            aria-label="Meetings"
          >
            <HomeIcon />
          </IconButton>
        </Grid>
        <Grid item xs className={clsx(classes.icon, isDocsSelected && classes.selected)}>
          <IconButton
            className={classes.iconButton}
            onClick={() => history.push('/docs')}
            aria-label="Documents"
          >
            <InsertDriveFileIcon />
          </IconButton>
        </Grid>
        <Grid item xs className={clsx(classes.icon, isPeopleSelected && classes.selected)}>
          <IconButton
            className={classes.iconButton}
            onClick={() => history.push('/people')}
            aria-label="People"
          >
            <GroupIcon />
          </IconButton>
        </Grid>
      </Grid>
    </header>
  );
};

export default NavBar;
