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
}

const useStyles = makeStyles((theme) => ({
  text: { color: theme.palette.text.hint },
  listItem: {
    borderRadius: `${theme.spacing(3)}px 0 0 ${theme.spacing(3)}px`,
    transition: theme.transitions.create('background', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
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
        className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
      >
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  );
};

export default RefreshButton;
