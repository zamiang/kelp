import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { person } from '../fetch/fetch-people';
import { IStore } from '../store/use-store';
import { logout } from '../user-profile/logout-button';
import RefreshButton from './refresh-button';

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
  const [currentUser, setCurrentUser] = useState<person | undefined>();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
                <img width="24" src="/icons/rotate.svg" className={classes.icon} />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
        {!isLoading && !currentUser && (
          <Grid item>
            <Tooltip title="Not authenticated">
              <IconButton>
                <img width="24" src="/icons/lock.svg" className={classes.icon} />
              </IconButton>
            </Tooltip>
          </Grid>
        )}
        <Grid item>
          <RefreshButton
            isLoading={props.store.isLoading}
            refresh={props.handleRefreshClick}
            lastUpdated={props.store.lastUpdated}
            loadingMessage={props.store.loadingMessage}
          />
        </Grid>
        {!isLoading && currentUser && (
          <Grid item>
            <IconButton
              className={clsx('ignore-react-onclickoutside')}
              aria-controls="simple-menu"
              aria-haspopup="true"
              aria-label="menu"
              onClick={handleClick}
            >
              <img width="24" src="/icons/settings.svg" />
            </IconButton>
          </Grid>
        )}
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          style={{ marginTop: 0 }}
        >
          <MenuItem
            onClick={() => {
              history.push('/meetings');
              handleClose();
            }}
          >
            Meetings
          </MenuItem>
          <MenuItem
            onClick={() => {
              history.push('/documents');
              handleClose();
            }}
          >
            Documents
          </MenuItem>
          <MenuItem
            onClick={() => {
              history.push('/people');
              handleClose();
            }}
          >
            People
          </MenuItem>
          <MenuItem
            onClick={() => {
              history.push('/week');
              handleClose();
            }}
          >
            Calendar
          </MenuItem>
          <MenuItem
            onClick={() => {
              history.push('/dashboard');
              handleClose();
            }}
          >
            Dashboard
          </MenuItem>
          <MenuItem
            onClick={() => {
              history.push('/summary');
              handleClose();
            }}
          >
            Summary
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              history.push('/settings');
              handleClose();
            }}
          >
            Settings
          </MenuItem>
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>
      </Grid>
    </div>
  );
};

export default NavRight;
