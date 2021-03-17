import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import Footer from '../components/homepage/footer';
import Header from '../components/homepage/header';
import UiBlocks from '../components/homepage/ui-blocks';
import { italicFontFamily } from '../constants/theme';

export const useStyles = makeStyles((theme) => ({
  container: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  colorContainer: {
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
  },
  heading: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 42,
    },
  },
  subheading: {
    marginTop: 48,
    fontSize: 32,
    [theme.breakpoints.down('sm')]: {
      fontSize: 26,
    },
  },
  loginMargin: {
    margin: theme.spacing(1),
  },
  loginPaper: {
    padding: theme.spacing(2),
  },
  hero: {
    marginTop: theme.spacing(15),
    marginBottom: theme.spacing(12),
    width: '100%',
    textAlign: 'center',
  },
  subpage: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(12),
    width: '100%',
  },
  buttonContainer: {
    marginTop: 48,
  },
  login: {
    margin: 0,
    width: 260,
    padding: theme.spacing(2),
  },
  body: {
    marginTop: theme.spacing(2),
  },
  section: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  hint: {
    marginTop: theme.spacing(2),
    fontStyle: 'italic',
  },
  link: {
    color: theme.palette.primary.dark,
  },
  meetingContainer: {
    width: '100%',
    textAlign: 'center',
    borderRadius: 300,
    marginTop: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#009191',
    [theme.breakpoints.down('sm')]: {
      borderRadius: 25,
      marginTop: theme.spacing(2),
    },
  },
  meetingImage: {
    display: 'block',
    paddingTop: 56,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    margin: '0px auto',
    maxWidth: 680,
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      maxWidth: 'none',
    },
  },
  bodyCopySection: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      maxWidth: 'none',
    },
  },
  italics: {
    fontFamily: italicFontFamily,
    fontStyle: 'italics',
  },
  loginButtonContainer: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      margin: '0px auto',
    },
  },
  emojiIcon: {
    fontSize: 26,
    marginRight: theme.spacing(2),
  },
}));

// <meta name="slack-app-id" content="A01E5A9263B" />

const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Head>
        <title>Kelp - Your information filtration system</title>
        <meta
          name="description"
          content="Kelp automatically organizes your documents, events and contacts to make work make sense."
        />
      </Head>
      <style jsx global>{`
        html body {
          background-color: #faf5eb;
        }
      `}</style>
      <Header />
      <div className={classes.hero}>
        <Container maxWidth="md">
          <Typography variant="h1" className={classes.heading}>
            Your information filtration system
          </Typography>
          <Typography className={classes.subheading}>
            Kelp automatically organizes your documents, events and contacts to make work make
            sense.
          </Typography>
        </Container>
        <Container className={classes.buttonContainer}>
          <Grid container alignItems="center" spacing={4} justify="center">
            <Grid item>
              <Button
                variant="contained"
                size="large"
                color="primary"
                className={classes.login}
                onClick={() => (window.location.pathname = '/dashboard')}
                disableElevation={true}
              >
                Log in with Google
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className={classes.login}
                href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
                disableElevation={true}
              >
                Add to Chrome
              </Button>
            </Grid>
          </Grid>
        </Container>
      </div>
      <Container maxWidth="lg">
        <div className={classes.meetingContainer}>
          <img src="images/extension.png" className={classes.meetingImage} />
        </div>
      </Container>
      <Container maxWidth="md" className={classes.bodyCopySection}>
        <Typography variant="h3" style={{ textAlign: 'center' }}>
          Kelp started out of a need for better way to prepare for meetings. It helps you quickly
          gather the information you need.
        </Typography>
      </Container>
      <UiBlocks />
      <Container maxWidth="md" className={classes.bodyCopySection}>
        <Typography variant="h2">Currently works with</Typography>
        <Container maxWidth="sm" style={{ textAlign: 'center' }}>
          <Typography variant="h3" style={{ marginBottom: 24 }}>
            Google
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            className={classes.login}
            onClick={() => (window.location.pathname = '/dashboard')}
            disableElevation={true}
            style={{ marginBottom: 48 }}
          >
            Log in with Google
          </Button>
          <Typography>
            Kelp currently works with Google and will expand to other integrations.
          </Typography>
          <Typography>
            <MuiLink
              target="_blank"
              color="primary"
              rel="noopener noreferrer"
              href="https://twitter.com/kelpnyc"
            >
              Let us know
            </MuiLink>{' '}
            what you would like us to add!
          </Typography>
        </Container>
      </Container>
      <Container maxWidth="md" className={classes.bodyCopySection}>
        <Typography variant="h2">Your data is your data</Typography>
        <Container maxWidth="sm">
          <Typography style={{ textAlign: 'center' }}>
            When visiting the Kelp website, your computer is storing and processing your data. Kelp
            is a static website that does not have any kind of data processing or data storage
            capability.
            <br />
            <MuiLink color="primary" href="/about">
              Read more
            </MuiLink>
          </Typography>
        </Container>
      </Container>
      <Divider />
      <Container maxWidth="md">
        <Grid container alignItems="center">
          <Grid
            sm={12}
            md={6}
            item
            className={clsx(classes.bodyCopySection, classes.loginButtonContainer)}
          >
            <Typography variant="h4">Ready to get started?</Typography>
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                className={classes.login}
                onClick={() => (window.location.pathname = '/dashboard')}
                disableElevation={true}
                style={{ width: 280 }}
              >
                Log in with Google
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                className={classes.login}
                href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
                disableElevation={true}
                style={{ width: 280, marginTop: 24 }}
              >
                Add to Chrome
              </Button>
            </div>
          </Grid>
          <Grid sm={12} md={6} item>
            <List disablePadding>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🎨</div>
                <ListItemText>Designed for people with too many meetings</ListItemText>
              </ListItem>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🗝</div>
                <ListItemText>Secure - Kelp does not store your data</ListItemText>
              </ListItem>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🪞</div>
                <ListItemText>Active & transparent development</ListItemText>
              </ListItem>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🦄</div>
                <ListItemText>Independently bootstrapped</ListItemText>
              </ListItem>
              <ListItem disableGutters>
                <div className={classes.emojiIcon}>🏎</div>
                <ListItemText>Fast and easy to use</ListItemText>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </div>
  );
};

export default App;
