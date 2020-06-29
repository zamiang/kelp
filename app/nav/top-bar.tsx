import { AppBar, IconButton, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import React from 'react';
import { drawerWidth } from '../dashboard';

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: 'white',
    zIndex: theme.zIndex.drawer + 1,
    borderBottom: `1px solid ${theme.palette.primary.light}`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
}));

interface IProps {
  isOpen: boolean;
  handleDrawerOpen: () => void;
}

const TopBar = (props: IProps) => {
  const classes = useStyles();

  return (
    <AppBar
      elevation={0}
      position="absolute"
      className={clsx(classes.appBar, props.isOpen && classes.appBarShift)}
    >
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open drawer"
          onClick={props.handleDrawerOpen}
          className={clsx(classes.menuButton, props.isOpen && classes.menuButtonHidden)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
