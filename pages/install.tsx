import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useStyles } from './index';

const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.hero}>
      <Container maxWidth="md">
        <Typography variant="h1" className={classes.heading}>
          Your information filtration system
        </Typography>
        <Typography className={classes.subheading}>
          Kelp automatically organizes your documents, events and contacts to make work make sense.
        </Typography>
      </Container>
      <Container className={classes.buttonContainer}>
        <Grid container alignItems="center" spacing={4} justify="center">
          <Grid item xs={12} sm={true}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              className={classes.login}
              onClick={() => (window.location.pathname = '/dashboard')}
              disableElevation={true}
              style={{ marginLeft: 'auto', display: 'block' }}
            >
              Sign In with Google
            </Button>
          </Grid>
          <Grid item xs={12} sm={true}>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              className={classes.login}
              style={{ marginRight: 'auto', display: 'block' }}
              href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
              disableElevation={true}
            >
              Add to Chrome
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
export default App;
