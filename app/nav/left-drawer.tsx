import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  styled,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PeopleIcon from '@material-ui/icons/People';
import clsx from 'clsx';
import React from 'react';
import config from '../config';
import { drawerWidth } from '../dashboard';
import { IDoc } from '../store/doc-store';
import { IPerson } from '../store/person-store';
import { ISegment } from '../store/time-store';
import RefreshButton from './refresh-button';
import Search from './search';

const useStyles = makeStyles((theme) => ({
  logo: {
    fontWeight: 700,
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
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
  logoImage: {
    width: 93,
    marginLeft: -28,
    marginRight: -12,
  },
  spacer: { margin: theme.spacing(2) },
  selected: { color: theme.palette.text.primary },
  unSelected: { color: theme.palette.text.hint },
}));

const StyledListItem = styled(ListItem)({
  '&.Mui-selected': {
    backgroundColor: 'white',
  },
});

export interface IProps {
  isOpen: boolean;
  handleDrawerClose: () => void;
  handleDrawerOpen: () => void;
  handlePersonClick: (personId: string) => void;
  handleMeetingsClick: () => void;
  handleDocsClick: () => void;
  handlePeopleClick: () => void;
  handleRefreshClick: () => void;
  people: IPerson[];
  lastUpdated: Date;
  documents: IDoc[];
  meetings: ISegment[];
  currentRoute: string;
}

const LeftDrawer = (props: IProps) => {
  const classes = useStyles();
  const isMeetingsSelected = props.currentRoute === '/';
  const isDocsSelected = props.currentRoute === '/docs';
  const isPeopleSelected = props.currentRoute === '/people';
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !props.isOpen && classes.drawerPaperClose),
      }}
      open={props.isOpen}
    >
      <div className={classes.toolbarIcon}>
        <IconButton onClick={props.handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <div className={classes.spacer} />
      <List>
        <ListItem>
          <ListItemIcon>
            <img className={classes.logoImage} src={`${config.DOMAIN}/images/kelp.svg`} />
          </ListItemIcon>
          <Typography variant="h4" className={classes.logo}>
            Kelp
          </Typography>
        </ListItem>
      </List>
      <div className={classes.spacer} />
      <Search {...props} />
      <div className={classes.spacer} />
      <List>
        <StyledListItem button onClick={props.handleMeetingsClick} selected={isMeetingsSelected}>
          <ListItemIcon>
            <DashboardIcon className={isMeetingsSelected ? classes.selected : classes.unSelected} />
          </ListItemIcon>
          <ListItemText
            primary="Calendar"
            className={isMeetingsSelected ? classes.selected : classes.unSelected}
          />
        </StyledListItem>
        <StyledListItem button onClick={props.handleDocsClick} selected={isDocsSelected}>
          <ListItemIcon>
            <InsertDriveFileIcon
              className={isDocsSelected ? classes.selected : classes.unSelected}
            />
          </ListItemIcon>
          <ListItemText
            primary="Docs"
            className={isDocsSelected ? classes.selected : classes.unSelected}
          />
        </StyledListItem>
        <StyledListItem button onClick={props.handlePeopleClick} selected={isPeopleSelected}>
          <ListItemIcon>
            <PeopleIcon className={isPeopleSelected ? classes.selected : classes.unSelected} />
          </ListItemIcon>
          <ListItemText
            primary="People"
            className={isPeopleSelected ? classes.selected : classes.unSelected}
          />
        </StyledListItem>
      </List>
      <div className={classes.spacer} />
      <RefreshButton refresh={props.handleRefreshClick} lastUpdated={props.lastUpdated} />
    </Drawer>
  );
};

export default LeftDrawer;
