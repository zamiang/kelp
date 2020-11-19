import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  popper: {
    zIndex: 2,
  },
  paper: {
    maxWidth: 500,
    maxHeight: '80vh',
    overflow: 'auto',
    [theme.breakpoints.down('sm')]: {
      maxWidth: `calc(100vw - 90px)`,
    },
  },
}));

const PopperContainer = (props: {
  anchorEl: any;
  children: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const classes = useStyles();
  return (
    <Popper
      open={props.isOpen}
      anchorEl={props.anchorEl}
      placement="bottom"
      className={classes.popper}
      modifiers={{
        offset: {
          enabled: true,
          offset: '0, -50',
        },
      }}
    >
      <ClickAwayListener
        onClickAway={() => {
          props.setIsOpen(false);
        }}
      >
        <Paper elevation={5} className={classes.paper}>
          {props.children}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default PopperContainer;
