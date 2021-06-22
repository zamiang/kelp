import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import LeftArrowIcon from '../../public/icons/minus.svg';
import RightArrowIcon from '../../public/icons/plus.svg';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  arrow: {
    margin: '0px auto',
    background: 'rgba(0, 0, 0, 0.1)',
    padding: 12,
  },
}));

export const RightArrow = (props: { onClick: () => void; isEnabled: boolean; count: number }) => {
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
      {props.isEnabled ? (
        <Typography>Hide</Typography>
      ) : (
        <Typography>Show {props.count} more</Typography>
      )}
    </div>
  );
};
