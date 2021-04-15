import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import BackIcon from '../../public/icons/back.svg';
import CloseIcon from '../../public/icons/close.svg';
import SearchIcon from '../../public/icons/search.svg';
import KelpLogo from '../../public/kelp.svg';
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
  innerContainer: {
    paddingRight: theme.spacing(2),
  },
  logo: {
    width: 40,
    height: 40,
    borderBottom: 0,
  },
  logoSelected: {
    background: theme.palette.secondary.light,
  },
  iconButton: {
    borderRadius: 0,
    width: '100%',
    paddingBottom: 10,
  },
  whiteHeader: {
    border: '0px',
    position: 'sticky',
    top: 0,
    left: 0,
    background: 'white',
    padding: theme.spacing(1),
    zIndex: 6,
    justifyContent: 'space-between',
  },
}));

const NavBar = () => {
  const classes = useStyles();
  const history = useHistory();
  const router = useLocation();

  const hasSearchParams = router.search.length > 0;
  const isHomeSelected = router.pathname === '/home';
  const [isSearchInputVisible, setSearchInputVisible] = useState<boolean>(hasSearchParams);

  if (!isHomeSelected) {
    return (
      <header className={classes.whiteHeader}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <IconButton
              onClick={() => {
                history.goBack();
              }}
            >
              <BackIcon width="24" height="24" />
            </IconButton>
          </Grid>
        </Grid>
      </header>
    );
  }

  return (
    <header className={classes.container}>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        className={classes.innerContainer}
      >
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton
                className={clsx(classes.iconButton, isHomeSelected && classes.logoSelected)}
                onClick={() => {
                  history.push('/home');
                }}
              >
                <KelpLogo className={classes.logo} />
              </IconButton>
            </Grid>
            {!isSearchInputVisible && (
              <Grid item>
                <IconButton onClick={() => setSearchInputVisible(true)}>
                  <SearchIcon width="24" height="24" />
                </IconButton>
              </Grid>
            )}
            {isSearchInputVisible && (
              <Grid item>
                <SearchBar />
              </Grid>
            )}
          </Grid>
        </Grid>
        {isSearchInputVisible && (
          <Grid item>
            <IconButton
              onClick={() => {
                history.push('/home');
                setSearchInputVisible(false);
              }}
            >
              <CloseIcon width="24" height="24" />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </header>
  );
};

export default NavBar;
