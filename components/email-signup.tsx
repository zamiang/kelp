import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  form: {
    marginTop: theme.spacing(3),
  },
  signup: {
    margin: theme.spacing(0, 2),
    backgroundColor: theme.palette.primary.dark,
    color: 'white',
  },
  input: {
    minWidth: 220,
  },
}));

const EmailSignup = () => {
  const classes = useStyles();
  return (
    <div>
      <Typography variant="h3">Subscribe</Typography>
      <Typography variant="h6">
        Sign up with your email address to receive news and updates.
      </Typography>
      <form
        className={classes.form}
        action="https://form.flodesk.com/submit"
        method="post"
        data-form="fdv2"
      >
        <input type="text" name="name" style={{ display: 'none' }} />
        <input
          type="hidden"
          name="submitToken"
          value="8662881cd115e6f4099c86f870d1fa4050f44d8bb5dfd3aded45185b024383f0187edd40a68bff8219d5faf90e91491294588c4f5ca0a4656f149e552cc6e68926ab37348793cfe138e2ed4876038dba40e141afefa45ed21aa89da176bb138a"
        />
        <Grid container alignItems="center" justify="flex-start">
          <Grid item>
            <TextField
              name="email"
              placeholder="Email address"
              required
              className={classes.input}
            />
          </Grid>
          <Grid item>
            <Button
              type="submit"
              data-form-el="submit"
              variant="contained"
              size="large"
              color="primary"
              className={classes.signup}
            >
              Subscribe
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default EmailSignup;
