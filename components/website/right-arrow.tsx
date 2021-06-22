import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import LeftArrowIcon from '../../public/icons/minus.svg';
import RightArrowIcon from '../../public/icons/plus.svg';

const useStyles = makeStyles(() => ({
  container: {
    position: 'absolute',
    top: 87,
    right: -110,
  },
  arrow: {
    background: 'rgba(0, 0, 0, 0.1)',
    padding: 12,
  },
}));

export const RightArrow = (props: { onClick: () => void; isEnabled: boolean }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <IconButton onClick={props.onClick} className={classes.arrow}>
        {props.isEnabled ? (
          <LeftArrowIcon width="24" height="24" />
        ) : (
          <RightArrowIcon width="24" height="24" />
        )}
      </IconButton>
    </div>
  );
};
