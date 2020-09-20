import { useAuth0 } from '@auth0/auth0-react';
import { List, ListItem } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import SecurityIcon from '@material-ui/icons/Security';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import Footer from '../components/homepage/footer';
import HomepageTopBar from '../components/homepage/homepage-top-bar';
import { useStyles } from './index';

const Security = () => {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar signIn={loginWithRedirect} color="security" />
        <Grid
          container
          className={clsx(classes.hero, classes.yellowBackground)}
          alignItems="center"
        >
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <Typography variant="h3">Security</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp only stores information that helps authenticate you, such as your account ID,
                email and a token that grants the Kelp website application access to your data. This
                is the same as when you click &lsquo;sign in with Google&rsquo; or &lsquo;sign in
                with Facebook&rsquo; on other websites, however when you make changes or add
                information, your changes are stored at the source and do not pass through Kelp’s
                website.
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
            <SecurityIcon className={clsx(classes.heroImage, classes.heroImageIcon)} />
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
