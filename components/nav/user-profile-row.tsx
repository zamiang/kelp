import { useAuth0 } from '@auth0/auth0-react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LoopIcon from '@material-ui/icons/Loop';
import React from 'react';
import { useStyles } from './left-drawer';

const UserProfileRow = (props: { isSelected: boolean }) => {
  const { user, isAuthenticated, isLoading, error } = useAuth0();
  const classes = useStyles();

  if (isLoading) {
    return (
      <ListItem>
        <ListItemIcon>
          <LoopIcon className={classes.avatar} />
        </ListItemIcon>
        <ListItemText>Loading</ListItemText>
      </ListItem>
    );
  }

  if (!isAuthenticated) {
    return (
      <ListItem>
        <ListItemIcon>
          <LockOpenIcon className={classes.avatar} />
        </ListItemIcon>
        <ListItemText>Not Authenticated</ListItemText>
      </ListItem>
    );
  }

  if (error) {
    return (
      <ListItem>
        <ListItemIcon>
          <ErrorOutlineIcon className={classes.avatar} />
        </ListItemIcon>
        <ListItemText>{error}</ListItemText>
      </ListItem>
    );
  }

  return (
    <ListItem button selected={props.isSelected} className={classes.listItem}>
      <ListItemIcon>
        <Avatar className={classes.avatar} src={user.picture} alt={user.name} />
      </ListItemIcon>
      <ListItemText>{user.name}</ListItemText>
    </ListItem>
  );
};

export default UserProfileRow;
