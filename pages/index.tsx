import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import Footer from '../components/homepage/footer';
import Header from '../components/homepage/header';
import UiBlocks from '../components/homepage/ui-blocks';
import { italicFontFamily } from '../constants/theme';

export const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  container: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  colorContainer: {
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
  },
  whiteContainer: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  heading: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.h2.fontSize,
      marginBottom: theme.spacing(2),
    },
  },
  containerWidth: {
    width: '100%',
  },
  loginMargin: {
    margin: theme.spacing(1),
  },
  loginPaper: {
    padding: theme.spacing(2),
  },
  hero: {
    marginTop: theme.spacing(8),
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
    marginTop: theme.spacing(3),
  },
  login: {
    margin: 0,
    padding: theme.spacing(2, 6),
    color: 'white',
  },
  body: {
    marginTop: theme.spacing(3),
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
    position: 'relative',
    maxWidth: 530,
    padding: theme.spacing(2),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: 'auto',
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
          background-color: #faf8f5;
        }
      `}</style>
      <div className={classes.colorContainer}>
        <Header />
        <Grid container className={classes.hero} alignItems="center">
          <Container maxWidth="xs">
            <Typography variant="h3" className={classes.heading}>
              Your information filtration system
            </Typography>
            <Typography variant="h5" className={classes.body}>
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
                  Sign In with Google
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant="contained"
                  size="large"
                  className={classes.login}
                  href="https://chrome.google.com/webstore/detail/kelp/onkkkcfnlbkoialleldfbgodakajfpnl"
                  disableElevation={true}
                  startIcon={<AddIcon />}
                >
                  Add to Chrome
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Grid>
      </div>
      <div className={classes.whiteContainer}>
        <Container maxWidth="md" className={classes.bodyCopySection}>
          <Typography variant="h4">
            Kelp started out of a need for better way to prepare for meetings. It helps you quickly
            gather the information you need to be effective.
          </Typography>
        </Container>
        <div style={{ background: '#faf8f5', textAlign: 'center' }}>
          <br />
          <br />
          <img src="images/meeting.png" />
        </div>
        <Divider />
        <UiBlocks />
        <Divider />
        <Container maxWidth="md" className={classes.bodyCopySection}>
          <Typography variant="h4">Your data is your data.</Typography>
          <br />
          <Typography>
            When visiting the Kelp website, your computer is storing and processing your data. Kelp
            is a static website that does not have any kind of data processing or data storage
            capability.{' '}
            <MuiLink color="primary" href="/about">
              Read more
            </MuiLink>
            .
          </Typography>
          <div className={classes.hint}>
            <Typography className={classes.italics}>
              Kelp currently works with Google and will expand to other integrations.
              <br />
              <MuiLink
                target="_blank"
                color="primary"
                rel="noopener noreferrer"
                href="https://twitter.com/kelpnyc"
              >
                Let us know what you would like us to add!
              </MuiLink>
            </Typography>
          </div>
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
                >
                  Log In with Google
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
        <Footer shouldAlignLeft={false} />
      </div>
    </div>
  );
};

export default App;
