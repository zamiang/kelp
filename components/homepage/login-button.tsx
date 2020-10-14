import { useAuth0 } from '@auth0/auth0-react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React from 'react';
import config from '../../constants/config';

export const loginWithRedirectArgs = {
  connection: 'google-oauth2',
  connection_scope: config.GOOGLE_SCOPES.join(', '),
};

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: 100,
    marginLeft: 'auto',
  },
  avatar: {
    width: 22,
    height: 22,
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
  },
}));

const LoginButton = () => {
  const { isLoading, isAuthenticated, error, user, loginWithRedirect } = useAuth0();
  const classes = useStyles();
  if (isLoading) {
    return <CircularProgress size={22} className={classes.avatar} color="inherit" />;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return (
      <Link href="/dashboard?tab=meetings">
        <Button className={classes.button} variant="outlined" disableElevation={true}>
          <Avatar className={classes.avatar} src={user.picture} alt={user.name} />
          My Dashboard
        </Button>
      </Link>
    );
  }
  return (
    <Button
      onClick={() => loginWithRedirect(loginWithRedirectArgs)}
      className={classes.button}
      variant="outlined"
      disableElevation={true}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
