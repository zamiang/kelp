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
import { signOut, useSession } from 'next-auth/client';
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
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
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: 'border 0.3s',
  },
  unSelected: {
    color: theme.palette.text.primary,
    transition: 'border 0.3s',
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    '&:hover': {
      borderBottom: `1px solid ${theme.palette.divider}`,
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
  },
  noOverflow: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  icon: {
    width: 22,
    height: 22,
  },
  avatar: {
    width: 60,
    height: 60,
    transition: 'opacity 0.3s',
    opacity: 1,
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.6,
    },
  },
}));

interface IProps {
  handleRefreshClick: () => void;
  lastUpdated: Date;
  isLoading: boolean;
  loadingMessage?: string;
  error?: Error;
}

const NavBar = (props: IProps) => {
  const classes = useStyles();
  const router = useLocation();
  const history = useHistory();
  const [session, isLoading] = useSession();
  const user = session && session.user;
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

  return (
    <header className={classes.drawerPaper}>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <IconButton
                className={clsx('ignore-react-onclickoutside')}
                onClick={() => (window.location.pathname = '/about')}
              >
                <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                className={clsx('ignore-react-onclickoutside')}
                onClick={() => history.push('/meetings')}
              >
                <HomeIcon className={isMeetingsSelected ? classes.selected : classes.unSelected} />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                className={clsx('ignore-react-onclickoutside')}
                onClick={() => history.push('/docs')}
              >
                <InsertDriveFileIcon
                  className={isDocsSelected ? classes.selected : classes.unSelected}
                />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton
                className={clsx('ignore-react-onclickoutside')}
                onClick={() => history.push('/people')}
              >
                <GroupIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
              </IconButton>
            </Grid>
            <Grid item>
              <SearchBar />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            {props.error && (
              <Grid item>
                <Typography variant="h6">{props.error.message}</Typography>
              </Grid>
            )}
            {isLoading && (
              <Grid item>
                <Tooltip title="Loading">
                  <React.Fragment>
                    <IconButton>
                      <LoopIcon className={classes.unSelected} />
                    </IconButton>
                  </React.Fragment>
                </Tooltip>
              </Grid>
            )}
            {!session && (
              <Grid item>
                <Tooltip title="Not authenticated">
                  <IconButton>
                    <LockOpenIcon className={classes.unSelected} />
                  </IconButton>
                </Tooltip>
              </Grid>
            )}
            <Grid item>
              <RefreshButton
                isLoading={props.isLoading}
                refresh={props.handleRefreshClick}
                lastUpdated={props.lastUpdated}
                loadingMessage={props.loadingMessage}
              />
            </Grid>
            {!isLoading && user && (
              <Grid item>
                <IconButton
                  className={clsx('ignore-react-onclickoutside')}
                  aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={handleClick}
                >
                  <Avatar
                    className={clsx(classes.unSelected, classes.icon)}
                    src={user.image || undefined}
                    alt={user.name || user.email || undefined}
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
              <MenuItem onClick={() => signOut({ callbackUrl: 'https://www.kelp.nyc' })}>
                Logout
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>
      </Grid>
    </header>
  );
};

export default NavBar;
