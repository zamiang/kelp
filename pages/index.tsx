import { useAuth0 } from '@auth0/auth0-react';
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

export const useStyles = makeStyles((theme) => ({
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
    backgroundColor: theme.palette.primary.main,
    width: '100%',
  },
  yellowBackground: {
    backgroundColor: config.YELLOW_BACKGROUND,
  },
  orangeBackground: {
    backgroundColor: config.ORANGE_BACKGROUND,
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
  largeAvatar: {
    marginLeft: 'auto',
    marginRight: 'auto',
    height: 120,
    width: 120,
    marginBottom: theme.spacing(2),
  },
  center: {
    textAlign: 'center',
  },
  listItem: {
    fontSize: '1rem',
    color: 'black',
  },
  hint: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontWeight: 700,
  },
  plan: {
    marginTop: theme.spacing(2),
  },
  heroImage: {
    width: '100%',
    height: 'auto',
    maxWidth: '586px',
    mixBlendMode: 'multiply',
  },
  heroImageIcon: {
    maxHeight: '200px',
  },
  row: {
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
  },
}));

const App = () => {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar signIn={loginWithRedirect} color="home" />
        <Grid container className={classes.hero} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <Typography variant="h3">Your information filtration system</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp brings your data together and organizes it to be simple and easy to understand.
                Kelp infers associations between information, such as between a person, a meeting
                with the person and document edits by the person.
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
            <img className={classes.heroImage} src="designer_file_case.png" />
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
              <Typography variant="h3">
                Kelp does not store your personal data or send your data to third parties.
              </Typography>
            </Container>
          </Grid>
        </Grid>
        <Grid container className={classes.info} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <Typography variant="h3">Your meeting helper</Typography>
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
    </div>
  );
};

export default App;
