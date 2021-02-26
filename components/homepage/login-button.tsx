import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { person } from '../fetch/fetch-people';
import { fetchSelf } from '../fetch/fetch-self';

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: 100,
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  avatar: {
    width: 22,
    height: 22,
    marginRight: theme.spacing(1),
    marginLeft: 'auto',
  },
}));

const LoginButton = () => {
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [currentUser, setCurrentUser] = useState<person | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('oauth2');
      if (accessToken) {
        const result = await fetchSelf(accessToken);
        if (result) {
          setCurrentUser(result);
        }
      }
      setIsLoading(false);
    };
    void fetchData();
  }, []);

  const classes = useStyles();
  if (isLoading) {
    return <CircularProgress size={22} className={classes.avatar} color="inherit" />;
  }

  if (currentUser) {
    return (
      <Link href="/dashboard">
        <Button className={classes.button} variant="outlined" disableElevation={true}>
          <Avatar
            className={classes.avatar}
            src={currentUser.imageUrl || undefined}
            alt={currentUser.emailAddresses[0] || undefined}
          />
          My Dashboard
        </Button>
      </Link>
    );
  }
  return (
    <Button
      onClick={() => (window.location.pathname = '/dashboard')}
      className={classes.button}
      variant="outlined"
      disableElevation={true}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
