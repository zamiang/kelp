import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles(() => ({
  paper: { maxWidth: 500, maxHeight: '80vh', overflow: 'auto' },
}));

const PopperContainer = (props: { anchorEl: any; children: any; isOpen: boolean }) => {
  const classes = useStyles();
  return (
    <Popper
      open={props.isOpen}
      anchorEl={props.anchorEl}
      placement="bottom"
      modifiers={{
        offset: {
          enabled: true,
          offset: '0, -150',
        },
      }}
    >
      <Paper elevation={5} className={classes.paper} onClick={(event) => event.stopPropagation()}>
        {props.children}
      </Paper>
    </Popper>
  );
};

export default PopperContainer;
