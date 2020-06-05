import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import clsx from 'clsx';
import React from 'react';
import { styles } from './dashboard';
import PeopleList from './people-list';

interface IProps {
  isOpen: boolean;
  classes: styles;
  handleDrawerClose: () => void;
  handlePersonClick: (personId: string) => void;
  handleMeetingsClick: () => void;
  people?:
    | {
        id: string;
        name?: string;
      }[]
    | null;
}

const LeftDrawer = (props: IProps) => (
  <Drawer
    variant="permanent"
    classes={{
      paper: clsx(props.classes.drawerPaper, !props.isOpen && props.classes.drawerPaperClose),
    }}
    open={props.isOpen}
  >
    <div className={props.classes.toolbarIcon}>
      <IconButton onClick={props.handleDrawerClose}>
        <ChevronLeftIcon />
      </IconButton>
    </div>
    <Divider />
    <List>
      <ListItem button onClick={props.handleMeetingsClick}>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Meetings" />
      </ListItem>
    </List>
    <Divider />
    <List>
      <PeopleList people={props.people} handlePersonClick={props.handlePersonClick} />
    </List>
  </Drawer>
);

export default LeftDrawer;
