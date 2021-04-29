import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import LockIcon from '../../public/icons/lock.svg';
import RotateIcon from '../../public/icons/rotate.svg';
import SearchIcon from '../../public/icons/search.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import { getGreeting } from '../shared/get-greeting';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';

const useStyles = makeStyles((theme) => ({
  container: {
    border: '0px',
    zIndex: 6,
    justifyContent: 'space-between',
    maxWidth: 800,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    background: theme.palette.background.paper,
    borderRadius: 10,
    minHeight: 55,
  },
  innerContainer: {},
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
  icon: {
    color: theme.palette.secondary.light,
    transition: 'border-color 0.6s',
    borderBottom: `3px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `3px solid ${theme.palette.divider}`,
    },
  },
  greeting: {
    textAlign: 'center',
    margin: theme.spacing(2),
  },
}));

const NavBar = (props: { store: IStore }) => {
  const classes = useStyles();
  const router = useHistory();

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [currentUser, setCurrentUser] = useState<IPerson | undefined>();
  const greeting = getGreeting();

  useEffect(() => {
    const fetchData = async () => {
      const result = await props.store.personDataStore.getSelf();
      if (result) {
        setCurrentUser(result);
      }
      setIsLoading(false);
    };
    void fetchData();
  }, [props.store.lastUpdated]);

  return (
    <Box boxShadow={1} className={classes.container}>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        className={classes.innerContainer}
        onClick={() => router.push('/search')}
      >
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton onClick={() => router.push('/search')}>
                <SearchIcon width="24" height="24" />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <div className={classes.greeting}>
            <Typography variant="h3" style={{ fontSize: 22, color: 'rgba(0,0,0,0.2)' }}>
              Good {greeting}
            </Typography>
          </div>
        </Grid>
        {props.store.error && (
          <Grid item>
            <Typography variant="h6">{props.store.error.message}</Typography>
          </Grid>
        )}
        {isLoading && (
          <Grid item>
            <Tooltip title="Loading">
              <IconButton aria-label="loading">
                <RotateIcon width="24" height="24" className={classes.icon} />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
        {!isLoading && !currentUser && (
          <Grid item>
            <Tooltip title="Not authenticated">
              <IconButton>
                <LockIcon width="24" height="24" className={classes.icon} />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
        {!isLoading && currentUser && (
          <Grid item>
            <IconButton
              onClick={(event) => {
                event.preventDefault();
                return router.push('/settings');
              }}
            >
              <SettingsIcon width="24" height="24" />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default NavBar;
