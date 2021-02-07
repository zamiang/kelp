import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';

interface IProps {
  lastUpdated: Date;
  refresh: () => void;
  isLoading: boolean;
}

const useStyles = makeStyles((theme) => ({
  '@keyframes spinner-rotation': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  text: { color: theme.palette.text.hint },
  button: {
    borderRadius: `${theme.spacing(3)}px 0 0 ${theme.spacing(3)}px`,
    transition: theme.transitions.create(['transform'], {
      duration: theme.transitions.duration.short,
    }),
  },
  loading: {
    animation: '$spinner-rotation linear infinite 1s',
  },
}));

const RefreshButton = (props: IProps) => {
  const classes = useStyles();
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [seconds]);
  return (
    <Tooltip title={`${formatDistanceToNow(props.lastUpdated)} ago`}>
      <IconButton
        onClick={props.refresh}
        className={clsx(
          classes.button,
          props.isLoading && classes.loading,
          'ignore-react-onclickoutside',
        )}
      >
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RefreshButton;
