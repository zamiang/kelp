import { useAuth0 } from '@auth0/auth0-react';
import { List, ListItem } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import Footer from '../components/homepage/footer';
import HomepageTopBar from '../components/homepage/homepage-top-bar';
import config from '../constants/config';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  container: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  containerWidth: {
    width: '100%',
  },
  hero: {
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    backgroundColor: config.YELLOW_BACKGROUND,
    width: '100%',
  },
  info: {
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    width: '100%',
  },
  login: {
    margin: theme.spacing(4, 0, 2),
    padding: theme.spacing(2, 6),
    backgroundColor: theme.palette.primary.dark,
    color: 'white',
  },

  loginTry: {
    margin: theme.spacing(4, 0, 2, 4),
    padding: theme.spacing(2, 6),
  },
  body: {
    marginTop: theme.spacing(3),
    fontWeight: 400,
  },
  hint: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 700,
  },
  plan: {
    marginTop: theme.spacing(2),
  },
  image: { width: '100%', maxWidth: '586px', mixBlendMode: 'multiply' },
  row: {
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
  },
}));

const Security = () => {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar signIn={loginWithRedirect} color="security" />
        <Grid container className={classes.hero} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <Typography variant="h3">About Kelp Security</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp only stores information that helps authenticate you, such as your account ID,
                email and a token that grants the Kelp website application access to your data. This
                is the same as when you click ‘sign in with Google’ or ‘sign in with Facebook' on
                other websites, however when you make changes or add information, your changes are
                stored at the source and do not pass through Kelp’s website.
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={loginWithRedirect}
                className={classes.login}
                disableElevation={true}
              >
                Log In
              </Button>
              <Link href="/test-dashboard">
                <Button
                  variant="outlined"
                  size="large"
                  className={classes.loginTry}
                  disableElevation={true}
                >
                  Try it out
                </Button>
              </Link>
            </Container>
          </Grid>
          <Grid item xs={6}>
            <img className={classes.image} src="designer_file_case.png" />
          </Grid>
        </Grid>
        <Grid container className={classes.info} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <Typography variant="h3">Security Practices</Typography>
            </Container>
          </Grid>
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <Grid container spacing={5}>
                <Grid item className={classes.row}>
                  <Typography variant="h6">Architecture</Typography>
                  <Typography variant="body1">
                    Kelp is a what is called a ‘static website’. This means that it does not have
                    any kind of data processing capability or data storage capability. When visiting
                    the Kelp website, your computer is storing and processing your data.
                  </Typography>
                </Grid>
                <Grid item className={classes.row}>
                  <Typography variant="h6">Authentication</Typography>
                  <Typography variant="body1">
                    Kelp uses a secure intermediate, Auth0, to authenticate you with Google and
                    other integrations. This keeps you in control of your data (or at least as in
                    control as you were before using Kelp). With this control, you can revoke access
                    to your data from Auth0 or Kelp at any time.
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h6">Data Access</Typography>
                  <Typography variant="body1">
                    By using this intermediary, we ensure that Kelp cannot access your data - only
                    your web browser then can use this token to request your data directly from
                    Google.
                  </Typography>
                </Grid>
              </Grid>
            </Container>
          </Grid>
        </Grid>
        <Grid
          container
          className={classes.info}
          alignItems="center"
          alignContent="center"
          justify="center"
        >
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <Typography variant="h3">Security practices</Typography>
              <Typography variant="body1">
                Neither Kelp or Auth0 store passwords or personal data. However, we do take security
                seriously. We take security very seriously. Kelp’s security pactices include but are
                not limited to
              </Typography>
              <List>
                <ListItem>Static code analysis</ListItem>
                <ListItem>Static dependency checking</ListItem>
                <ListItem>Web vulnerability scanning</ListItem>
                <ListItem>End to end encryption</ListItem>
              </List>
            </Container>
          </Grid>
        </Grid>
        <Footer />
      </div>
    </div>
  );
};

export default Security;
