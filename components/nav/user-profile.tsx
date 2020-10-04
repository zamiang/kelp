import { useAuth0 } from '@auth0/auth0-react';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import React from 'react';

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return (
    <ListItem>
      <ListItemIcon>
        <Avatar src={user.picture} alt={user.name} />
      </ListItemIcon>
      <ListItemText>{user.name}</ListItemText>
    </ListItem>
  );
};

export default Profile;
