import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import HttpsIcon from '@material-ui/icons/Https';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import SecurityIcon from '@material-ui/icons/Security';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import clsx from 'clsx';
import React from 'react';
import Footer from '../components/homepage/footer';
import HomepageTopBar from '../components/homepage/homepage-top-bar';
import { useLoginWithRedirect } from '../components/store/login';
import { useStyles } from './index';

const Security = () => {
  const classes = useStyles();
  const loginWithRedirect = useLoginWithRedirect();
  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar signIn={loginWithRedirect} color="security" />
        <Grid
          container
          className={clsx(classes.hero, classes.yellowBackground)}
          alignItems="center"
          alignContent="center"
        >
          <Container>
            <SecurityIcon className={clsx(classes.heroImage, classes.heroImageIcon)} />
            <Typography variant="h2" className={classes.center}>
              Kelp keeps your personal data secure
              <br />
              &hellip;by not storing it at all
            </Typography>
          </Container>
        </Grid>
        <Grid container className={classes.info} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <Typography variant="h3">Security Practices</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp only stores information that helps authenticate you, such as your account ID,
                email and a token that grants the Kelp website application access to your data. This
                is the same as when you click &lsquo;sign in with Google&rsquo; or &lsquo;sign in
                with Facebook&rsquo; on other websites, however when you make changes or add
                information, your changes are stored at the source and do not pass through Kelp’s
                website.
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <List>
                <ListItem divider>
                  <ListItemIcon>
                    <LocationCityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Architecture"
                    secondary="Kelp is a what is called a ‘static website’. This means that it does not have any kind of data processing capability or data storage capability. When visiting the Kelp website, your computer is storing and processing your data."
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemIcon>
                    <VpnKeyIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Authentication"
                    secondary="Kelp uses a secure intermediate, Auth0, to authenticate you with Google and other integrations. This keeps you in control of your data (or at least as in control as you were before using Kelp). With this control, you can revoke access to your data from Auth0 or Kelp at any time."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <HttpsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Access"
                    secondary="By using this intermediary, we ensure that Kelp cannot access your data - only your web browser then can use this token to request your data directly from Google."
                  />
                </ListItem>
              </List>
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
              <Typography variant="h3">Methods</Typography>
              <Typography variant="body1">
                Neither Kelp or Auth0 store passwords or personal data. However, we do take security
                seriously. We take security very seriously. Kelp’s security pactices include but are
                not limited to:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Static code analysis" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Static dependency checking" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Web vulnerability scanning" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="End to end encryption" />
                </ListItem>
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
