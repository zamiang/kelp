import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import clsx from 'clsx';
import React from 'react';
import Footer from '../components/homepage/footer';
import HomepageTopBar from '../components/homepage/homepage-top-bar';
import { useStyles } from './index';

const Security = () => {
  const classes = useStyles();
  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar color="security" />
        <Grid
          container
          className={clsx(classes.hero, classes.yellowBackground)}
          alignItems="center"
          alignContent="center"
        >
          <Container>
            <img
              src="/icons/locked-line.svg"
              className={clsx(classes.heroImage, classes.heroImageIcon)}
            />
            <Typography variant="h2" className={classes.center}>
              Kelp keeps your personal data secure
              <br />
              &hellip;by not storing it at all
            </Typography>
          </Container>
        </Grid>
        <Grid
          container
          className={classes.info}
          alignItems="center"
          alignContent="center"
          justify="center"
        >
          <Grid item xs={6}>
            <img src="/icons/Key.svg" />
            <Typography variant="h3">What data does Kelp store?</Typography>
            <Typography variant="h6" className={classes.body}>
              Kelp stores minimum amount of information needed to contact you.
            </Typography>
            <Typography variant="h6" className={classes.body}>
              This contact information, your name and email, is stored in a secure intermediate
              named Auth0 where you can edit or remove that data at any time. Data displayed in
              Kelp, such as your calendar events, contacts and document names are not stored by
              Kelp. That data is retrieved directly by your web browser from Google’s APIs fresh
              each time you open Kelp. Your calendar events, contacts and document names do not pass
              through Kelp or Auth0 web servers.
            </Typography>
          </Grid>
        </Grid>
        <Grid container className={classes.info} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <img className={classes.centerIcon} src="/icons/lock-color.svg" />
              <Typography variant="h3">Security Practices</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp puts your privacy and security first. Kelp makes money by providing you a tool
                that you find useful, not by selling your data. We deeply believe that limiting
                Kelp’s access to your data is both our best interest and your best interest and hope
                to be an example of privacy forward companies.
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <List>
                <ListItem divider>
                  <ListItemIcon className={classes.smallIconContainer}>
                    <img src="/icons/cloud-color.svg" className={classes.smallIcon} />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                      secondary: classes.largeListItemText,
                    }}
                    primary="Architecture"
                    secondary="Kelp is a what is called a ‘static website’. This means that it does not have any kind of data processing capability or data storage capability. When visiting the Kelp website, your computer is storing and processing your data."
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemIcon className={classes.smallIconContainer}>
                    <img src="/icons/key-color.svg" className={classes.smallIcon} />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                      secondary: classes.largeListItemText,
                    }}
                    primary="Authentication"
                    secondary="Kelp uses a secure intermediate, Auth0, to authenticate you with Google and other integrations. In doing so, we keep you in control of your data (or at least as in control as you were before using Kelp). With this control, you can revoke access to your data from Auth0 or Google at any time."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon className={classes.smallIconContainer}>
                    <img src="/icons/present-color.svg" className={classes.smallIcon} />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                      secondary: classes.largeListItemText,
                    }}
                    primary="Data Access"
                    secondary="By using Auth0, we ensure that Kelp cannot access your data - only your web browser then can use this token to request your data directly from Google."
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
              <img src="/icons/Relax.svg" />
              <Typography variant="h3">You can relax</Typography>
              <Typography variant="h6" className={classes.body}>
                Neither Kelp or Auth0 store passwords or personal data. However, we do take security
                seriously and apply experience from e-commerce, and healthcare data security. Kelp’s
                security practices include but are not limited to
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Static code analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Static dependency checking"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="Web vulnerability scanning"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <img className={classes.smallIcon} src="/icons/positive-color.svg" />
                  </ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemText,
                    }}
                    primary="End to end encryption"
                  />
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
