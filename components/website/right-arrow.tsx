import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import ChevronIcon from '../../public/icons/chevron-right.svg';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
  arrow: {
    margin: '0px auto',
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '8px 14px',
    fontFamily: theme.typography.fontFamily,
    borderRadius: 22,
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
      <Button
        endIcon={
          props.isEnabled ? (
            <ChevronIcon className={classes.upArrow} width="24" height="24" />
          ) : (
            <ChevronIcon className={classes.downArrow} width="24" height="24" />
          )
        }
        onClick={props.onClick}
        className={classes.arrow}
      >
        {props.isEnabled ? 'Hide' : `More`}
      </Button>
    </div>
  );
};
