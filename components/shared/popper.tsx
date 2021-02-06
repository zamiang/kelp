import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  popper: {
    zIndex: 5, // above the avatar group
  },
  paper: {
    maxWidth: 550,
    minHeight: 200, // helps with the bounce on init
    maxHeight: '80vh',
    overflow: 'auto',
    minWidth: 500,
    overflowX: 'hidden',
    [theme.breakpoints.down('sm')]: {
      maxWidth: `calc(100vw - 40px)`,
      minWidth: 300,
    },
  },
}));

const PopperContainer = (props: {
  anchorEl: any;
  children: any;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  offset?: string;
}) => {
  const classes = useStyles();
  return (
    <Popper open={props.isOpen} anchorEl={props.anchorEl} className={classes.popper}>
      <ClickAwayListener
        onClickAway={() => {
          props.setIsOpen(false);
        }}
      >
        <Paper elevation={5} className={classes.paper} onClick={(event) => event.stopPropagation()}>
          {props.children}
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
};

export default PopperContainer;
