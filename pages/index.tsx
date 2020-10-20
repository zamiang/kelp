import { useAuth0 } from '@auth0/auth0-react';
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
import React from 'react';
import EmailSignup from '../components/email-signup';
import Footer from '../components/homepage/footer';
import LoginButton, { loginWithRedirectArgs } from '../components/homepage/login-button';
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
  heading: {
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.h4.fontSize,
      marginBottom: theme.spacing(2),
    },
  },
  hero: {
    marginTop: theme.spacing(6),
    padding: theme.spacing(6),
    backgroundColor: theme.palette.primary.main,
    width: '100%',
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
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  heroImageIcon: {
    height: '120px',
    width: '120px',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
  row: {
    borderBottom: `1px solid ${theme.palette.text.primary}`,
  },
  smallIcon: {
    maxWidth: 60,
    maxHeight: 60,
  },
  smallIconContainer: {
    marginRight: 20,
  },
  homepageFooterSpacer: {
    marginTop: theme.spacing(6),
  },
  largeListItemText: {
    fontSize: theme.typography.body1.fontSize,
  },
  largeListItemTextBold: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(1),
  },
  centerIcon: {
    maxWidth: '50%',
    margin: '0px auto',
    display: 'block',
  },
  loginButton: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const App = () => {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();
  return (
    <div className={classes.container}>
      <style jsx global>{`
        html body {
          background-color: ${config.BLUE_BACKGROUND};
        }
      `}</style>
      <div className={classes.containerWidth}>
        <Grid container className={clsx(classes.hero, classes.heroNoMarginTop)} alignItems="center">
          <Grid item sm={7}>
            <Container maxWidth="sm">
              <div className={classes.loginButton}>
                <LoginButton />
              </div>
              <img style={{ maxWidth: 120, marginLeft: -32 }} src="kelp.svg" />
              <Typography variant="h3" className={classes.heading}>
                Your information filtration system
              </Typography>
              <Typography variant="h6" className={classes.body}>
                Kelp organizes your documents, events and contacts to make work make sense.
              </Typography>
              <EmailSignup />
              <Grid item sm={10}>
                <List className={classes.list}>
                  <ListItem disableGutters={true}>
                    <ListItemText
                      classes={{
                        primary: classes.largeListItemTextBold,
                        secondary: classes.largeListItemText,
                      }}
                      primary="Quickly Prepare For Meetings"
                      secondary="Kelp scans your calendar and documents to automatically collect the documents you need. It then magically annotates your calendar. Easy."
                    />
                  </ListItem>
                  <ListItem disableGutters={true}>
                    <ListItemText
                      classes={{
                        primary: classes.largeListItemTextBold,
                        secondary: classes.largeListItemText,
                      }}
                      primary="Manage Work Relationships"
                      secondary="Kelp infers associations between information, such as between a person, a meeting with the person and document edits by the person."
                    />
                  </ListItem>
                  <ListItem disableGutters={true}>
                    <ListItemText
                      classes={{
                        primary: classes.largeListItemTextBold,
                        secondary: classes.largeListItemText,
                      }}
                      primary="Your Data"
                      secondary="When visiting the Kelp website, your computer is storing and processing your data. Kelp is a static website that does not have any kind of data processing or data storage capability."
                    />
                  </ListItem>
                </List>
              </Grid>
              <div className={classes.buttonContainer}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  className={classes.login}
                  onClick={() => loginWithRedirect(loginWithRedirectArgs)}
                  disableElevation={true}
                >
                  Log In with Google
                </Button>
                <a
                  className={classes.loginTryLink}
                  href="/test-dashboard?tab=meetings"
                  target="_blank"
                >
                  Try Kelp with fake data ›
                </a>
              </div>
              <div className={classes.hint}>
                Kelp is currently free but may add a paid version in the future.
              </div>
              <div className={classes.hint}>
                Kelp currently works with Google and will expand to other integrations.
                <br />
                <MuiLink
                  target="_blank"
                  color={'primary.dark' as any}
                  href="https://twitter.com/kelpnyc"
                >
                  Let us know what you would like us to add!
                </MuiLink>
              </div>
              <Footer shouldAlignLeft={true} />
            </Container>
          </Grid>
          <Grid item sm={5}>
            <img className={classes.heroImage} src="designer_file_case.png" />
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default App;
