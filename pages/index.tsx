import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import SentimentVerySatisfiedIcon from '@material-ui/icons/SentimentVerySatisfied';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import Footer from '../components/homepage/footer';
import Header from '../components/homepage/header';
import UiBlocks from '../components/homepage/ui-blocks';
import config from '../constants/config';

export const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  container: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  blueContainer: {
    width: '100%',
    backgroundColor: config.BLUE_BACKGROUND,
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
    marginTop: theme.spacing(2),
  },
  login: {
    margin: 0,
    padding: theme.spacing(2, 6),
    backgroundColor: theme.palette.primary.dark,
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
  bodyLargeCopy: {
    fontSize: theme.typography.h5.fontSize,
  },
  loginButtonContainer: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      margin: '0px auto',
    },
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
          background-color: ${config.BLUE_BACKGROUND};
        }
      `}</style>
      <div className={classes.blueContainer}>
        <Header />
        <Grid container className={classes.hero} alignItems="center">
          <Container maxWidth="xs">
            <Typography variant="h3" className={classes.heading}>
              Your information filtration system
            </Typography>
            <Typography variant="h6" className={classes.body}>
              Kelp automatically organizes your documents, events and contacts to make work make
              sense.
            </Typography>
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
          </Container>
        </Grid>
      </div>
      <div className={classes.whiteContainer}>
        <Container maxWidth="md" className={classes.bodyCopySection}>
          <Typography className={classes.bodyLargeCopy}>
            Kelp started out of a need for better way to prepare for meetings. It aims to help you
            quickly gather the information you need to be effective.
          </Typography>
        </Container>
        <Divider />
        <Container maxWidth="md">
          <Paper className={classes.meetingContainer} elevation={2}>
            <div style={{ fontWeight: 500 }}>todo</div>
          </Paper>
        </Container>
        <Divider />
        <UiBlocks />
        <Container maxWidth="md" className={classes.bodyCopySection}>
          <Typography variant="h4">Your data is your data.</Typography>
          <br />
          <Typography variant="h6">
            When visiting the Kelp website, your computer is storing and processing your data. Kelp
            is a static website that does not have any kind of data processing or data storage
            capability.{' '}
            <MuiLink color="primary" href="/about">
              Read more
            </MuiLink>
            .
          </Typography>
          <div className={classes.hint}>
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
                  <ListItemIcon>
                    <SentimentVerySatisfiedIcon />
                  </ListItemIcon>
                  <ListItemText>Designed for people with too many meetings</ListItemText>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <SentimentVerySatisfiedIcon />
                  </ListItemIcon>
                  <ListItemText>Secure - Kelp does not store your data</ListItemText>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <SentimentVerySatisfiedIcon />
                  </ListItemIcon>
                  <ListItemText>Active & transparent development</ListItemText>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <SentimentVerySatisfiedIcon />
                  </ListItemIcon>
                  <ListItemText>Independently bootstrapped</ListItemText>
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <SentimentVerySatisfiedIcon />
                  </ListItemIcon>
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
