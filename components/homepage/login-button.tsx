import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  button: {
    minWidth: 100,
    marginLeft: 'auto',
    paddingTop: 15,
    paddingBottom: 14,
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(7),
    borderRadius: 40,
    textTransform: 'uppercase',
    letterSpacing: '1.25px',
    fontSize: 14,
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
  const classes = useStyles();

  return (
    <Button
      onClick={() => (window.location.pathname = '/dashboard')}
      className={classes.button}
      variant="outlined"
      color="primary"
      disableElevation={true}
    >
      Log In
    </Button>
  );
};

export default LoginButton;
