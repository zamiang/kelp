import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import DateRangeIcon from '@material-ui/icons/DateRange';
import HomeIcon from '@material-ui/icons/Home';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import PeopleIcon from '@material-ui/icons/People';
import PublicIcon from '@material-ui/icons/Public';
import clsx from 'clsx';
import { useSession } from 'next-auth/client';
import React from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { drawerWidth } from '../../pages/dashboard';
import RefreshButton from './refresh-button';
import SearchBar from './search-bar';

const shouldRenderHome = true;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    position: 'sticky',
    left: 0,
    top: 0,
    whiteSpace: 'nowrap',
    width: drawerWidth,
    background: 'none',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: 'flex',
    justifyContent: 'space-between',
    height: '100vh',
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
  date: {
    color: theme.palette.text.hint,
  },
  spacer: { margin: theme.spacing(2) },
  selected: {
    color: theme.palette.text.primary,
  },
  unSelected: { color: theme.palette.text.hint },
  listItem: {
    borderRadius: theme.spacing(3),
    textOverflow: 'ellipsis',
    whiteWpace: 'nowrap',
    overflow: 'hidden',
    transition: theme.transitions.create('background', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  iconContainer: {
    minWidth: theme.spacing(5),
  },
  logoContainer: {
    marginTop: -4,
    marginBottom: 6,
  },
  logo: {
    width: 60,
    height: 60,
    marginLeft: -15,
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
  const isHomeSelected = tab.includes('home');
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
      open={true}
    >
      <div>
        <List>
          <Link href="/about">
            <ListItem className={classes.logoContainer}>
              <ListItemIcon className={classes.iconContainer}>
                <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="h4" color="textPrimary">
                  <b>Kelp</b>
                </Typography>
              </ListItemText>
            </ListItem>
          </Link>
          <Divider />
          {isLoading && (
            <ListItem>
              <ListItemIcon className={classes.iconContainer}>
                <LoopIcon className={classes.unSelected} />
              </ListItemIcon>
              <ListItemText>Loading</ListItemText>
            </ListItem>
          )}
          {!session && (
            <ListItem>
              <ListItemIcon className={classes.iconContainer}>
                <LockOpenIcon className={classes.unSelected} />
              </ListItemIcon>
              <ListItemText>Not Authenticated</ListItemText>
            </ListItem>
          )}
        </List>
        <div>
          <SearchBar />
        </div>
        <List>
          {shouldRenderHome && (
            <Link to="/" component={RouterLink} underline="none">
              <ListItem
                button
                selected={isHomeSelected}
                className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
              >
                <ListItemIcon className={classes.iconContainer}>
                  <HomeIcon className={isHomeSelected ? classes.selected : classes.unSelected} />
                </ListItemIcon>
                <ListItemText
                  primary="Home"
                  className={isHomeSelected ? classes.selected : classes.unSelected}
                />
              </ListItem>
            </Link>
          )}
          <Link to="/week" component={RouterLink} underline="none">
            <ListItem
              button
              selected={isWeekSelected}
              className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            >
              <ListItemIcon className={classes.iconContainer}>
                <DateRangeIcon className={isWeekSelected ? classes.selected : classes.unSelected} />
              </ListItemIcon>
              <ListItemText
                primary="This Week"
                className={isWeekSelected ? classes.selected : classes.unSelected}
              />
            </ListItem>
          </Link>
          <Link to="/summary" component={RouterLink} underline="none">
            <ListItem
              button
              selected={isSummarySelected}
              className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            >
              <ListItemIcon className={classes.iconContainer}>
                <PublicIcon className={isSummarySelected ? classes.selected : classes.unSelected} />
              </ListItemIcon>
              <ListItemText
                primary="Month Summary"
                className={isSummarySelected ? classes.selected : classes.unSelected}
              />
            </ListItem>
          </Link>
          <ListSubheader>DATA</ListSubheader>
          <Link to="/meetings" component={RouterLink} underline="none">
            <ListItem
              button
              selected={isMeetingsSelected}
              className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            >
              <ListItemIcon className={classes.iconContainer}>
                <CalendarViewDayIcon
                  className={isMeetingsSelected ? classes.selected : classes.unSelected}
                />
              </ListItemIcon>
              <ListItemText
                primary="Meetings"
                className={isMeetingsSelected ? classes.selected : classes.unSelected}
              />
            </ListItem>
          </Link>
          <Link to="/docs" component={RouterLink} underline="none">
            <ListItem
              button
              selected={isDocsSelected}
              className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            >
              <ListItemIcon className={classes.iconContainer}>
                <InsertDriveFileIcon
                  className={isDocsSelected ? classes.selected : classes.unSelected}
                />
              </ListItemIcon>
              <ListItemText
                primary="Documents"
                className={isDocsSelected ? classes.selected : classes.unSelected}
              />
            </ListItem>
          </Link>
          <Link to="/people" component={RouterLink} underline="none">
            <ListItem
              button
              selected={isPeopleSelected}
              className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            >
              <ListItemIcon className={classes.iconContainer}>
                <PeopleIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
              </ListItemIcon>
              <ListItemText
                primary="People"
                className={isPeopleSelected ? classes.selected : classes.unSelected}
              />
            </ListItem>
          </Link>
        </List>
      </div>
      <List>
        <RefreshButton refresh={props.handleRefreshClick} lastUpdated={props.lastUpdated} />
        {!isLoading && user && (
          <ListItem
            button
            className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            onClick={() => history.push('/settings')}
          >
            <ListItemIcon className={classes.iconContainer}>
              <Avatar
                className={clsx(classes.unSelected, classes.icon)}
                src={user.image || undefined}
                alt={user.name || user.email || undefined}
              />
            </ListItemIcon>
            <ListItemText primary={user.name || user.email || undefined} />
          </ListItem>
        )}
      </List>
    </Drawer>
  );
};

export default NavBar;
