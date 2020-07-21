import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import { useGoogleLogin } from 'react-google-login';
import config from '../config';
import Footer from './footer';
import HomepageTopBar from './homepage-top-bar';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '100%',
  },
  hero: {
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    backgroundColor: theme.palette.secondary.main,
    width: '100%',
  },
  info: {
    marginTop: theme.spacing(9),
    padding: theme.spacing(9),
    width: '100%',
  },
  submit: {
    margin: theme.spacing(4, 0, 2),
    padding: theme.spacing(2, 6),
    color: 'white',
    textTransform: 'none',
  },
  body: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  hint: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 700,
  },
  plan: {
    marginTop: theme.spacing(2),
  },
  image: { width: '100%', maxWidth: '586px' },
  primaryDark: { color: theme.palette.primary.dark },
  row: {
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
  },
}));

const HomePage = (props: { setGoogleLoginState: (response: any) => void }) => {
  const classes = useStyles();
  const { signIn } = useGoogleLogin({
    // TODO: Handle GoogleOfflineResponse and remove response: any
    onSuccess: (response: any) => props.setGoogleLoginState(response),
    onFailure: (error: any) => {
      console.error(error);
    },
    clientId: process.env.GOOGLE_CLIENT_ID || 'error!',
    cookiePolicy: 'single_host_origin',
    autoLoad: false,
    fetchBasicProfile: true,
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly', // Despite not needing the content of messages, readonly is required to filter emails by date
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive.activity.readonly',
      'https://www.googleapis.com/auth/calendar.events.readonly',
    ].join(' '),
  });

  return (
    <div className={classes.container}>
      <HomepageTopBar signIn={signIn} />
      <Grid container className={classes.hero} alignItems="center">
        <Grid item xs={6}>
          <Container maxWidth="xs">
            <Typography variant="h3" className={classes.primaryDark}>
              Your information filtration system
            </Typography>
            <Typography variant="h6" className={clsx(classes.hint, classes.primaryDark)}>
              Kelp does not store your data or send your data to any third parties.
            </Typography>
            <Typography variant="h6" className={classes.body}>
              Kelp brings your data together and organizes it to be simple and easy to understand.
              Kelp infers associations between information, such as between a person, a meeting with
              the person and document edits by the person.
            </Typography>
            <Button
              color="primary"
              variant="contained"
              size="large"
              onClick={signIn}
              className={classes.submit}
              disableElevation={true}
            >
              Log In with Google
            </Button>
            <Typography variant="body1" className={classes.plan}>
              View the{' '}
              <Link underline="always" href={config.PROJECT_PLAN_LINK}>
                project plan
              </Link>
              .
            </Typography>
          </Container>
        </Grid>
        <Grid item xs={6}>
          <img className={classes.image} src={`${config.DOMAIN}/images/designer_file_case.png`} />
        </Grid>
      </Grid>
      <Grid container className={classes.info} alignItems="center">
        <Grid item xs={6}>
          <Container maxWidth="xs">
            <Typography variant="h3" className={classes.primaryDark}>
              Your meeting helper
            </Typography>
          </Container>
        </Grid>
        <Grid item xs={6}>
          <Container maxWidth="xs">
            <Grid container spacing={5}>
              <Grid item className={classes.row}>
                <Typography variant="h6">
                  Kelp does not store your data or send your data to any third parties.
                </Typography>
                <Typography variant="body1">
                  Kelp brings your data together and organizes it to be simple and easy to
                  understand. Kelp infers associations between information, such as between a
                  person, a meeting with the person and document edits by the person.
                </Typography>
              </Grid>
              <Grid item className={classes.row}>
                <Typography variant="h6">
                  Kelp does not store your data or send your data to any third parties.
                </Typography>
                <Typography variant="body1">
                  Kelp brings your data together and organizes it to be simple and easy to
                  understand. Kelp infers associations between information, such as between a
                  person, a meeting with the person and document edits by the person.
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  Kelp does not store your data or send your data to any third parties.
                </Typography>
                <Typography variant="body1">
                  Kelp brings your data together and organizes it to be simple and easy to
                  understand. Kelp infers associations between information, such as between a
                  person, a meeting with the person and document edits by the person.
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
};

export default HomePage;
