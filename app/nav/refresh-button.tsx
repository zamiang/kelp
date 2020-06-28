import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useState } from 'react';

interface IProps {
  lastUpdated: Date;
  refresh: () => void;
}

const useStyles = makeStyles((theme) => ({
  text: { color: theme.palette.text.hint },
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
    <List>
      <ListItem button dense onClick={props.refresh}>
        <ListItemIcon>
          <RefreshIcon color="secondary" />
        </ListItemIcon>
        <ListItemText
          primary={`${formatDistanceToNow(props.lastUpdated)} ago`}
          className={classes.text}
        />
      </ListItem>
    </List>
  );
};

export default RefreshButton;
