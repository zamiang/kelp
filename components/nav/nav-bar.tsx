import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import GroupIcon from '@material-ui/icons/Group';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { person } from '../fetch/fetch-people';
import { IStore } from '../store/use-store';
import { logout } from '../user-profile/logout-button';
import RefreshButton from './refresh-button';
import SearchBar from './search-bar';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    position: 'sticky',
    top: 0,
    left: 0,
    background: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    zIndex: 6,
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(9),
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

const NavBar = (props: IProps) => {
  const classes = useStyles();
  const router = useLocation();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [currentUser, setCurrentUser] = useState<person | undefined>();

  const tab = router.pathname;
  const isMeetingsSelected = tab.includes('meetings');
  const isDocsSelected = tab.includes('docs');
  const isPeopleSelected = tab.includes('people');

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
    <header className={classes.drawerPaper}>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton
                className={clsx('ignore-react-onclickoutside', classes.iconButton)}
                onClick={() => (window.location.pathname = '/about')}
              >
                <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
              </IconButton>
            </Grid>
            <Grid item className={clsx(classes.icon, isMeetingsSelected && classes.selected)}>
              <IconButton
                className={clsx('ignore-react-onclickoutside', classes.iconButton)}
                onClick={() => history.push('/meetings')}
                aria-label="Meetings"
              >
                <HomeIcon />
              </IconButton>
            </Grid>
            <Grid item className={clsx(classes.icon, isDocsSelected && classes.selected)}>
              <IconButton
                className={clsx('ignore-react-onclickoutside', classes.iconButton)}
                onClick={() => history.push('/docs')}
                aria-label="Documents"
              >
                <InsertDriveFileIcon />
              </IconButton>
            </Grid>
            <Grid item className={clsx(classes.icon, isPeopleSelected && classes.selected)}>
              <IconButton
                className={clsx('ignore-react-onclickoutside', classes.iconButton)}
                onClick={() => history.push('/people')}
                aria-label="People"
              >
                <GroupIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <SearchBar />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
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
                    <LoopIcon className={classes.icon} />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            {!isLoading && !currentUser && (
              <Grid item>
                <Tooltip title="Not authenticated">
                  <IconButton>
                    <LockOpenIcon className={classes.icon} />
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
                  <Avatar
                    className={classes.logo}
                    src={currentUser.imageUrl || undefined}
                    alt={`Profile photo for ${
                      currentUser.name || currentUser.emailAddresses[0] || undefined
                    }`}
                  />
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
        </Grid>
      </Grid>
    </header>
  );
};

export default NavBar;
