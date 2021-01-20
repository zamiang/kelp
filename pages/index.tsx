import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { signIn } from 'next-auth/client';
import Head from 'next/head';
import React from 'react';
import Footer from '../components/homepage/footer';
import Header from '../components/homepage/header';
import ExpandedMeeting from '../components/meeting/expand-meeting';
import useStore, { meetingId } from '../components/store/use-homepage-store';
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
      fontSize: theme.typography.h4.fontSize,
      marginBottom: theme.spacing(2),
    },
  },
  hero: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(12),
    width: '100%',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  heroNoMarginTop: {
    marginTop: 0,
  },
  yellowBackground: {
    backgroundColor: config.YELLOW_BACKGROUND,
  },
  orangeBackground: {
    backgroundColor: config.ORANGE_BACKGROUND,
  },
  purpleBackground: {
    backgroundColor: config.PURPLE_BACKGROUND,
  },
  pinkBackground: {
    backgroundColor: config.PINK_BACKGROUND,
  },
  info: {
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    width: '100%',
    fontSize: theme.typography.body1.fontSize,
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
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
  loginMargin: {
    margin: theme.spacing(1),
  },
  loginTryLink: {
    margin: theme.spacing(0, 3),
    cursor: 'pointer',
    display: 'inline-block',
    color: theme.palette.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'block',
      margin: theme.spacing(3, 0),
    },
  },
  body: {
    marginTop: theme.spacing(3),
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: '0.9285714285714286rem',
    color: theme.palette.text.secondary,
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
    maxWidth: 480,
    padding: theme.spacing(2),
    margin: '0px auto',
    pointerEvents: 'none',
  },
  bodyCopySection: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
    maxWidth: theme.breakpoints.width('sm'),
  },
  bodyLargeCopy: {
    fontSize: theme.typography.h5.fontSize,
  },
  sectionLeft: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  sectionText: {
    padding: theme.spacing(6),
  },
  sectionRight: {},
  section: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

const App = () => {
  const classes = useStyles();
  const store = useStore();
  return (
    <div className={classes.container}>
      <Head>
        <title>Kelp - Your information filtration system</title>
        <meta
          name="description"
          content="Kelp organizes your documents, events and contacts to make work make sense."
        />
        <meta name="slack-app-id" content="A01E5A9263B" />
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
                onClick={() => signIn('google', { callbackUrl: config.REDIRECT_URI })}
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
        <div className={classes.meetingContainer}>
          <ExpandedMeeting
            hideHeader={true}
            meetingId={meetingId}
            close={() => undefined}
            {...store}
          />
        </div>
        <Divider />
        <Grid container className={classes.section}>
          <Grid item xs={6} className={clsx(classes.sectionLeft, classes.sectionText)}>
            <Container maxWidth="xs" style={{ marginRight: 0 }}>
              <Typography variant="h3">Organization for humans</Typography>
              <Typography variant="h6">
                Kelp meets you where you are. It doesn’t ask you to change how you organize your
                work or how you collaborate.
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={6} className={classes.sectionRight}>
            image here
          </Grid>
        </Grid>
        <Grid container className={classes.section}>
          <Grid item xs={6} className={classes.sectionLeft}>
            image here
          </Grid>
          <Grid item xs={6} className={clsx(classes.sectionRight, classes.sectionText)}>
            <Container maxWidth="xs" style={{ marginLeft: 0 }}>
              <Typography variant="h3">Quickly Prepare For Meetings</Typography>
              <Typography variant="h6">
                Kelp scans your calendar and documents to automatically collect the documents you
                need. It then magically annotates your calendar. Easy.
              </Typography>
            </Container>
          </Grid>
        </Grid>
        <Grid container className={classes.section}>
          <Grid item xs={6} className={clsx(classes.sectionLeft, classes.sectionText)}>
            <Container maxWidth="xs" style={{ marginRight: 0 }}>
              <Typography variant="h3">Manage Work Relationships</Typography>
              <Typography variant="h6">
                Kelp infers associations between information, such as between a person, a meeting
                with the person and document edits by the person.
              </Typography>
            </Container>
          </Grid>
          <Grid item xs={6} className={classes.sectionRight}>
            image here
          </Grid>
        </Grid>
        <Container maxWidth="md" className={classes.bodyCopySection}>
          <div className={classes.hint}>
            Your data is your data. When visiting the Kelp website, your computer is storing and
            processing your data. Kelp is a static website that does not have any kind of data
            processing or data storage capability.{' '}
            <MuiLink color="primary" href="/about">
              Read more
            </MuiLink>
            .
          </div>
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
        <Footer shouldAlignLeft={false} />
      </div>
    </div>
  );
};

export default App;
