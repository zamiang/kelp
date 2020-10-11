import { useAuth0 } from '@auth0/auth0-react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import EmailSignup from '../components/email-signup';
import Footer from '../components/homepage/footer';
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
  loginTryLink: {
    padding: theme.spacing(2, 6),
    cursor: 'pointer',
    display: 'inline-block',
    color: theme.palette.primary.dark,
    fontSize: theme.typography.h6.fontSize,
    textDecoration: 'none',
    margin: 0,
    '&:hover': {
      textDecoration: 'underline',
    },
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
    paddingLeft: 0,
  },
  list: {
    marginTop: theme.spacing(2),
  },
  hint: {
    marginTop: theme.spacing(2),
    fontStyle: 'italic',
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
  smallIcon: {
    maxWidth: 60,
  },
  smallIconContainer: {
    marginRight: 20,
  },
  largeListItemText: {
    fontSize: theme.typography.h6.fontSize,
  },
  largeListItemTextBold: {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
  },
  centerIcon: {
    maxWidth: '50%',
    margin: '0px auto',
    display: 'block',
  },
}));

const App = () => {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();
  return (
    <div className={clsx(classes.root, classes.container)}>
      <div className={classes.containerWidth}>
        <Grid container className={clsx(classes.hero, classes.heroNoMarginTop)} alignItems="center">
          <Grid item xs={6}>
            <Container maxWidth="sm">
              <img style={{ maxWidth: 120, marginLeft: -32 }} src="kelp.svg" />
              <Typography variant="h3">Your information filtration system</Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp brings your data together and organizes it to be simple and easy to understand.
              </Typography>
              <EmailSignup />
              <List className={classes.list}>
                <ListItem className={classes.listItem}>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemTextBold,
                      secondary: classes.largeListItemText,
                    }}
                    primary="Stay Informed"
                    secondary="Kelp infers associations between information, such as between a person, a meeting with the person and document edits by the person."
                  />
                </ListItem>
                <ListItem className={classes.listItem}>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemTextBold,
                      secondary: classes.largeListItemText,
                    }}
                    primary="Less Busy Work"
                    secondary="Kelp scans your calendar and documents to automatically to collect the documents you need. We then magically populate you calendar. Easy."
                  />
                </ListItem>
                <ListItem className={classes.listItem}>
                  <ListItemText
                    classes={{
                      primary: classes.largeListItemTextBold,
                      secondary: classes.largeListItemText,
                    }}
                    primary="Your Data"
                    secondary="Kelp is a ‘static website’. This means that it does not have any kind of data processing capability or data storage capability. When visiting the Kelp website, your computer is storing and processing your data."
                  />
                </ListItem>
              </List>
              <div className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={classes.login}
                  onClick={loginWithRedirect}
                  disableElevation={true}
                >
                  Log In With Google
                </Button>
                <Link href="/test-dashboard?tab=meetings">
                  <span className={classes.loginTryLink}>Try Kelp with fake data ›</span>
                </Link>
              </div>
              <div className={classes.hint}>
                Kelp is currently free but may add a paid version in the future.
              </div>
            </Container>
          </Grid>
          <Grid item xs={6}>
            <img className={classes.heroImage} src="designer_file_case.png" />
          </Grid>
          <Grid item xs={12}>
            <Footer />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default App;
