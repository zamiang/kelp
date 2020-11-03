import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import React from 'react';

const PopperContainer = (props: { anchorEl: any; children: any; isOpen: boolean }) => {
  const id = 'spring-popper';
  return (
    <Popper id={id} open={props.isOpen} placement="left" anchorEl={props.anchorEl}>
      <Paper style={{ maxWidth: 500 }}>{props.children}</Paper>
    </Popper>
  );
};

export default PopperContainer;
