import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import { signIn, useSession } from 'next-auth/client';
import Link from 'next/link';
import React from 'react';
import config from '../../constants/config';

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
  const [session, isLoading] = useSession();
  const classes = useStyles();
  const user = session && session.user;
  if (isLoading) {
    return <CircularProgress size={22} className={classes.avatar} color="inherit" />;
  }

  if (user) {
    return (
      <Link href="/dashboard?tab=meetings">
        <Button className={classes.button} variant="outlined" disableElevation={true}>
          <Avatar className={classes.avatar} src={user.image} alt={user.email} />
          My Dashboard
        </Button>
      </Link>
    );
  }
  return (
    <Button
      onClick={() => signIn('google', { callbackUrl: config.REDIRECT_URI })}
      className={classes.button}
      variant="outlined"
      disableElevation={true}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
