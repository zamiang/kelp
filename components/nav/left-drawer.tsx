import { useAuth0 } from '@auth0/auth0-react';
import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import CalendarViewDayIcon from '@material-ui/icons/CalendarViewDay';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DateRangeIcon from '@material-ui/icons/DateRange';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import PeopleIcon from '@material-ui/icons/People';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import { drawerWidth } from '../../pages/dashboard';
import { IDoc } from '../store/doc-store';
import { IPerson } from '../store/person-store';
import { ISegment } from '../store/time-store';
import RefreshButton from './refresh-button';
import Search from './search';

const useStyles = makeStyles((theme) => ({
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  chevronRight: {
    transform: 'rotate(180deg)',
    transition: theme.transitions.create('transition', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  chevronLeft: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transition', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaper: {
    border: '0px',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    display: 'flex',
    justifyContent: 'space-between',
    height: '100vh',
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
    borderRadius: `0 ${theme.spacing(3)}px ${theme.spacing(3)}px 0`,
    transition: theme.transitions.create('background', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  avatar: {
    width: 22,
    height: 22,
  },
}));

/**
const ListItem = styled(ListItem)((root: any) => ({
  borderRadius: `0 ${root.theme.spacing(3)}px ${root.theme.spacing(3)}px 0`,
  transition: root.theme.transitions.create('background', {
    easing: root.theme.transitions.easing.sharp,
    duration: root.theme.transitions.duration.enteringScreen,
  }),
  '&.Mui-selected': {
    backgroundColor: root.theme.palette.secondary.main,
  },
}));
*/

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
        <ListItem className={classes.toolbarIcon}>
          <ListItemIcon>
            <IconButton onClick={props.isOpen ? props.handleDrawerClose : props.handleDrawerOpen}>
              <ChevronLeftIcon
                className={props.isOpen ? classes.chevronLeft : classes.chevronRight}
              />
            </IconButton>
          </ListItemIcon>
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
          <ListItem button selected={isWeekSelected} className={classes.listItem}>
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
          <ListItem button selected={isMeetingsSelected} className={classes.listItem}>
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
          <ListItem button selected={isDocsSelected} className={classes.listItem}>
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
          <ListItem button selected={isPeopleSelected} className={classes.listItem}>
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
            <ListItem button selected={isProfileSelected} className={classes.listItem}>
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
