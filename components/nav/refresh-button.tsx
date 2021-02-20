import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';

interface IProps {
  lastUpdated: Date;
  refresh: () => void;
  isLoading: boolean;
  loadingMessage?: string;
}

const useStyles = makeStyles((theme) => ({
  '@keyframes spinner-rotation': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  text: { color: theme.palette.text.hint },
  button: {
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
      <React.Fragment>
        <Typography style={{ display: 'inline-block' }} variant="body1">
          {props.loadingMessage}
        </Typography>
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
      </React.Fragment>
    </Tooltip>
  );
};

export default RefreshButton;
