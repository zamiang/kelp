import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import clsx from 'clsx';
import React from 'react';
import { styles } from './app';
import PeopleList from './people-list';

interface IProps {
  isOpen: boolean;
  classes: styles;
  handleDrawerClose: () => void;
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
    <PeopleList people={props.people} />
  </Drawer>
);

export default LeftDrawer;
