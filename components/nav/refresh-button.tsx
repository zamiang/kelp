import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
      <ListItem button dense onClick={props.refresh} className={'ignore-react-onclickoutside'}>
        <ListItemIcon>
          <RefreshIcon />
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
