import { useAuth0 } from '@auth0/auth0-react';
import { Typography } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import DateRangeIcon from '@material-ui/icons/DateRange';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import PeopleIcon from '@material-ui/icons/People';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { drawerWidth } from '../../pages/dashboard';
import { IDoc } from '../store/doc-store';
import { IPerson } from '../store/person-store';
import { ISegment } from '../store/time-store';
import RefreshButton from './refresh-button';
import Search from './search';

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: '0px',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    background: 'none',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: 'flex',
    justifyContent: 'space-between',
    height: '100vh',
    [theme.breakpoints.down('sm')]: {
      width: theme.spacing(7),
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
    borderRadius: `${theme.spacing(3)}px 0 0 ${theme.spacing(3)}px`,
    transition: theme.transitions.create('background', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  avatar: {
    width: 22,
    height: 22,
  },
  logo: {
    width: 60,
    height: 60,
    marginLeft: -15,
  },
}));

export interface IProps {
  isOpen: boolean;
  handleDrawerClose: () => void;
  handleDrawerOpen: () => void;
  handleRefreshClick: () => void;
  people: IPerson[];
  lastUpdated: Date;
  documents: IDoc[];
  meetings: ISegment[];
  tab: 'meetings' | 'docs' | 'people' | 'week' | 'settings';
}

const LeftDrawer = (props: IProps) => {
  const classes = useStyles();
  const { user, isAuthenticated, isLoading, error } = useAuth0();

  const isMeetingsSelected = props.tab === 'meetings';
  const isDocsSelected = props.tab === 'docs';
  const isPeopleSelected = props.tab === 'people';
  const isWeekSelected = props.tab === 'week';
  const isProfileSelected = props.tab === 'settings';
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !props.isOpen && classes.drawerPaperClose),
      }}
      open={props.isOpen}
    >
      <List>
        <ListItem>
          <ListItemIcon>
            <img className={classes.logo} src="/kelp.svg" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="h4">
              <b>Kelp</b>
            </Typography>
          </ListItemText>
        </ListItem>
        {isLoading && (
          <ListItem>
            <ListItemIcon>
              <LoopIcon className={classes.avatar} />
            </ListItemIcon>
            <ListItemText>Loading</ListItemText>
          </ListItem>
        )}
        {!isAuthenticated && (
          <ListItem>
            <ListItemIcon>
              <LockOpenIcon className={classes.avatar} />
            </ListItemIcon>
            <ListItemText>Not Authenticated</ListItemText>
          </ListItem>
        )}
        {error && (
          <ListItem>
            <ListItemIcon>
              <ErrorOutlineIcon className={classes.avatar} />
            </ListItemIcon>
            <ListItemText>{error}</ListItemText>
          </ListItem>
        )}
        <Search {...props} />
        <Link href="?tab=week">
          <ListItem
            button
            selected={isWeekSelected}
            className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
          >
            <ListItemIcon>
              <DateRangeIcon className={isWeekSelected ? classes.selected : classes.unSelected} />
            </ListItemIcon>
            <ListItemText
              primary="Week"
              className={isWeekSelected ? classes.selected : classes.unSelected}
            />
          </ListItem>
        </Link>
        <Link href="?tab=meetings">
          <ListItem
            button
            selected={isMeetingsSelected}
            className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
          >
            <ListItemIcon>
              <CalendarViewDayIcon
                className={isMeetingsSelected ? classes.selected : classes.unSelected}
              />
            </ListItemIcon>
            <ListItemText
              primary="Events"
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
            <ListItemIcon>
              <InsertDriveFileIcon
                className={isDocsSelected ? classes.selected : classes.unSelected}
              />
            </ListItemIcon>
            <ListItemText
              primary="Docs"
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
            <ListItemIcon>
              <PeopleIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
            </ListItemIcon>
            <ListItemText
              primary="People"
              className={isPeopleSelected ? classes.selected : classes.unSelected}
            />
          </ListItem>
        </Link>
      </List>
      <List>
        <RefreshButton refresh={props.handleRefreshClick} lastUpdated={props.lastUpdated} />
        {isAuthenticated && !isLoading && (
          <Link href="?tab=settings">
            <ListItem
              button
              selected={isProfileSelected}
              className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
            >
              <ListItemIcon>
                <Avatar className={classes.avatar} src={user.picture} alt={user.name} />
              </ListItemIcon>
              <ListItemText>{user.name}</ListItemText>
            </ListItem>
          </Link>
        )}
      </List>
    </Drawer>
  );
};

export default LeftDrawer;
