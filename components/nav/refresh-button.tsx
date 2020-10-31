import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
  iconContainer: {
    minWidth: theme.spacing(5),
  },
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
    <ListItem
      button
      dense
      onClick={props.refresh}
      className={clsx(classes.listItem, 'ignore-react-onclickoutside')}
    >
      <ListItemIcon className={classes.iconContainer}>
        <RefreshIcon />
      </ListItemIcon>
      <ListItemText
        primary={`${formatDistanceToNow(props.lastUpdated)} ago`}
        className={classes.text}
      />
    </ListItem>
  );
};

export default RefreshButton;
