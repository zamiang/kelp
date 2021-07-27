import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import ChevronIconWhite from '../../public/icons/chevron-right-white.svg';
import ChevronIcon from '../../public/icons/chevron-right.svg';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
    textAlign: 'center',
  },
  arrow: {
    margin: '0 auto',
    background: theme.palette.divider,
    padding: '8px 18px',
    fontFamily: theme.typography.fontFamily,
    borderRadius: 22,
    width: '100%',
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

export const RightArrow = (props: {
  onClick: () => void;
  isEnabled: boolean;
  count: number;
  isDarkMode: boolean;
}) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Button
        endIcon={
          props.isEnabled ? (
            props.isDarkMode ? (
              <ChevronIconWhite className={classes.upArrow} width="24" height="24" />
            ) : (
              <ChevronIcon className={classes.upArrow} width="24" height="24" />
            )
          ) : props.isDarkMode ? (
            <ChevronIconWhite className={classes.downArrow} width="24" height="24" />
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
