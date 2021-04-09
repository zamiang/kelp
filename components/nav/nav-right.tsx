import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import LockIcon from '../../public/icons/lock.svg';
import RotateIcon from '../../public/icons/rotate.svg';
import SettingsIcon from '../../public/icons/settings.svg';
import { IPerson } from '../store/data-types';
import { IStore } from '../store/use-store';
import RefreshButton from './refresh-button';

const shouldShowLoading = false;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    position: 'fixed',
    top: theme.spacing(1),
    right: theme.spacing(1),
    zIndex: 6,
  },
  selected: {
    color: `${theme.palette.secondary.dark} !important`,
    borderBottom: `3px solid ${theme.palette.primary.main} !important`,
  },
  icon: {
    color: theme.palette.secondary.light,
    transition: 'border-color 0.6s',
    borderBottom: `3px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `3px solid ${theme.palette.divider}`,
    },
  },
  iconContainer: {
    minWidth: theme.spacing(5),
  },
  logoContainer: {
    marginTop: -4,
    marginBottom: 6,
  },
  logo: {
    width: 24,
    height: 24,
    borderBottom: 0,
  },
  noOverflow: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    borderRadius: 0,
    paddingBottom: 10,
  },
}));

interface IProps {
  handleRefreshClick: () => void;
  store: IStore;
}

const NavRight = (props: IProps) => {
  const classes = useStyles();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [currentUser, setCurrentUser] = useState<IPerson | undefined>();

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
    <div className={classes.drawerPaper}>
      <Grid container alignItems="center">
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
        {shouldShowLoading && (
          <Grid item>
            <RefreshButton
              isLoading={props.store.isLoading}
              refresh={props.handleRefreshClick}
              lastUpdated={props.store.lastUpdated}
              loadingMessage={props.store.loadingMessage}
            />
          </Grid>
        )}
        {!isLoading && currentUser && (
          <Grid item>
            <IconButton
              onClick={() => {
                history.push('/settings');
              }}
            >
              <SettingsIcon width="24" height="24" />
            </IconButton>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default NavRight;
