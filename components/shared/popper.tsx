import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import React from 'react';

const PopperContainer = (props: { anchorEl: any; children: any; isOpen: boolean }) => (
  <Popper open={props.isOpen} anchorEl={props.anchorEl}>
    <Paper elevation={5} style={{ maxWidth: 500 }}>
      {props.children}
    </Paper>
  </Popper>
);

export default PopperContainer;
