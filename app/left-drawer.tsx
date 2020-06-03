import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import clsx from 'clsx';
import React from 'react';
import { styles } from './app';

interface IProps {
  isOpen: boolean;
  classes: styles;
  handleDrawerClose: () => void;
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
    <List>List of stuff</List>
    <Divider />
    <List>List of stuff 2</List>
  </Drawer>
);

export default LeftDrawer;
