import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import config from '../components/config';
import Footer from '../components/homepage/footer';
import HomepageTopBar from '../components/homepage/homepage-top-bar';

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

const App = () => {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();

  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <HomepageTopBar signIn={loginWithRedirect} />
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
                Kelp infers associations between information, such as between a person, a meeting
                with the person and document edits by the person.
              </Typography>
              <Button
                color="primary"
                variant="contained"
                size="large"
                onClick={loginWithRedirect}
                className={classes.submit}
                disableElevation={true}
              >
                Log In with Google
              </Button>
              <Typography variant="body1" className={classes.plan}>
                View the <a href={config.PROJECT_PLAN_LINK}>project plan</a>.
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
    </div>
  );
};

export default App;
