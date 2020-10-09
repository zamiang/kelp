import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import clsx from 'clsx';
import React from 'react';
import EmailSignup from '../components/email-signup';
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
  loginTryLink: {
    textDecoration: 'none',
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
    height: '120px',
    width: '120px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
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
        <HomepageTopBar color="home" />
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
                className={classes.login}
                onClick={loginWithRedirect}
                disableElevation={true}
              >
                Log In
              </Button>
              <a
                href="/test-dashboard?tab=meetings"
                target="_blank"
                className={classes.loginTryLink}
              >
                <Button
                  variant="outlined"
                  size="large"
                  className={classes.loginTry}
                  disableElevation={true}
                >
                  Try it out
                </Button>
              </a>
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
            <EmailSignup />
          </Grid>
        </Grid>
        <Grid container className={classes.info} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="xs">
              <Typography variant="h3">Your meeting helper</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp does not store your personal data or send your data to third parties.
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
                    <LocationCityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Architecture"
                    secondary="Kelp is a what is called a ‘static website’. This means that it does not have any kind of data processing capability or data storage capability. When visiting the Kelp website, your computer is storing and processing your data."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationCityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Architecture"
                    secondary="Kelp is a what is called a ‘static website’. This means that it does not have any kind of data processing capability or data storage capability. When visiting the Kelp website, your computer is storing and processing your data."
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

export default App;
