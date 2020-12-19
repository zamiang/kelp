import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
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
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { drawerWidth } from '../../pages/dashboard';
import RefreshButton from './refresh-button';
import SearchBar from './search-bar';

const shouldRenderHome = true;

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    position: 'relative',
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
      width: theme.spacing(7),
      paddingLeft: 0,
    },
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
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
  tab: 'meetings' | 'docs' | 'people' | 'week' | 'settings' | 'summary' | 'search' | 'home';
}

const LeftDrawer = (props: IProps) => {
  const classes = useStyles();
  const router = useRouter();
  const [session, isLoading] = useSession();
  const user = session && session.user;
  const isMobile = typeof document !== 'undefined' && document.body.clientWidth < 500;
  const isOpen = isMobile ? false : true;
  const anchor = isMobile ? 'top' : 'left';
  const isSummarySelected = props.tab === 'summary';
  const isMeetingsSelected = props.tab === 'meetings';
  const isDocsSelected = props.tab === 'docs';
  const isPeopleSelected = props.tab === 'people';
  const isWeekSelected = props.tab === 'week';
  const isHomeSelected = props.tab === 'home';
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper),
      }}
      anchor={anchor}
      open={isOpen}
    >
      <div>
        <List>
          <Link href="/about">
            <ListItem className={classes.logoContainer}>
              <ListItemIcon className={classes.iconContainer}>
                <img className={classes.logo} src="/kelp.svg" alt="Kelp logo" />
              </ListItemIcon>
              <ListItemText>
                <Typography variant="h4">
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
        <SearchBar />
        <List>
          {shouldRenderHome && (
            <Link href="?tab=home">
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
          <Link href="?tab=week">
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
          <Link href="?tab=summary">
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
        </List>
        <List>
          <ListSubheader>DATA</ListSubheader>
          <Link href="?tab=meetings">
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
          <Link href="?tab=docs">
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
          <Link href="?tab=people">
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
            onClick={() => router.push('?tab=settings')}
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

export default LeftDrawer;
