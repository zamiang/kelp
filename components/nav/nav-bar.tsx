import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import clsx from 'clsx';
import { useSession } from 'next-auth/client';
import React from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
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
    width: 50,
    height: 50,
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
}

const NavBar = (props: IProps) => {
  const classes = useStyles();
  const router = useLocation();
  const history = useHistory();
  const [session, isLoading] = useSession();
  const user = session && session.user;
  const tab = router.pathname;
  const isSummarySelected = tab.includes('summary');
  const isMeetingsSelected = tab.includes('meetings');
  const isDocsSelected = tab.includes('docs');
  const isPeopleSelected = tab.includes('people');
  const isWeekSelected = tab.includes('week');
  const isHomeSelected = tab === '/';
  return (
    <header className={classes.drawerPaper}>
      <Grid container alignItems="center" justify="space-between">
        <Grid item>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Link href="/about" underline="none">
                <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
              </Link>
            </Grid>
            <Grid item>
              <Link to="/" component={RouterLink} underline="none">
                <ListItem className={'ignore-react-onclickoutside'}>
                  <ListItemText
                    primary="Dashboard"
                    className={isHomeSelected ? classes.selected : classes.unSelected}
                  />
                </ListItem>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/week" component={RouterLink} underline="none">
                <ListItem className={'ignore-react-onclickoutside'}>
                  <ListItemText
                    primary="Calendar"
                    className={isWeekSelected ? classes.selected : classes.unSelected}
                  />
                </ListItem>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/summary" component={RouterLink} underline="none">
                <ListItem className={'ignore-react-onclickoutside'}>
                  <ListItemText
                    primary="Summary"
                    className={isSummarySelected ? classes.selected : classes.unSelected}
                  />
                </ListItem>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container>
            <Grid item>
              <Link to="/meetings" component={RouterLink} underline="none">
                <ListItem className={clsx('ignore-react-onclickoutside')}>
                  <ListItemText
                    primary="Meetings"
                    className={isMeetingsSelected ? classes.selected : classes.unSelected}
                  />
                </ListItem>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/docs" component={RouterLink} underline="none">
                <ListItem className={clsx('ignore-react-onclickoutside')}>
                  <ListItemText
                    primary="Documents"
                    className={isDocsSelected ? classes.selected : classes.unSelected}
                  />
                </ListItem>
              </Link>
            </Grid>
            <Grid item>
              <Link to="/people" component={RouterLink} underline="none">
                <ListItem className={clsx('ignore-react-onclickoutside')}>
                  <ListItemText
                    primary="People"
                    className={isPeopleSelected ? classes.selected : classes.unSelected}
                  />
                </ListItem>
              </Link>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container alignItems="center">
            <Grid item>
              <SearchBar />
            </Grid>
            {isLoading && (
              <Grid item>
                <Tooltip title="Loading">
                  <IconButton>
                    <LoopIcon className={classes.unSelected} />
                  </IconButton>
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
              <RefreshButton refresh={props.handleRefreshClick} lastUpdated={props.lastUpdated} />
            </Grid>
            {!isLoading && user && (
              <Grid item>
                <IconButton
                  className={clsx('ignore-react-onclickoutside')}
                  onClick={() => history.push('/settings')}
                >
                  <Avatar
                    className={clsx(classes.unSelected, classes.icon)}
                    src={user.image || undefined}
                    alt={user.name || user.email || undefined}
                  />
                </IconButton>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </header>
  );
};

export default NavBar;
