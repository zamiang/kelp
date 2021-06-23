import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import ChevronIcon from '../../public/icons/chevron-right.svg';

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
  showMoreText: {
    color: theme.palette.text.hint,
  },
  upArrow: {
    transform: 'rotate(-90deg)',
  },
  downArrow: {
    transform: 'rotate(90deg)',
  },
}));

export const RightArrow = (props: { onClick: () => void; isEnabled: boolean; count: number }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <IconButton onClick={props.onClick} className={classes.arrow}>
        {props.isEnabled ? (
          <ChevronIcon className={classes.upArrow} width="24" height="24" />
        ) : (
          <ChevronIcon className={classes.downArrow} width="24" height="24" />
        )}
      </IconButton>
      {props.isEnabled ? (
        <Typography>Hide</Typography>
      ) : (
        <Typography className={classes.showMoreText}>Show {props.count} more</Typography>
      )}
    </div>
  );
};
