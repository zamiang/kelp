import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import Head from 'next/head';
import React from 'react';
import Footer from '../components/homepage/footer';
import UiBlocks from '../components/homepage/ui-blocks';
import { italicFontFamily } from '../constants/theme';

export const useStyles = makeStyles((theme) => ({
  container: {
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
  installButtonContainer: {
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(4),
    },
  },
  colorContainer: {
    width: '100%',
    backgroundColor: theme.palette.secondary.light,
  },
  footerContainer: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(10),
    textAlign: 'center',
  },
  logoImage: {
    height: 120,
    opacity: 1,
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.5,
    },
    [theme.breakpoints.down('md')]: {
      height: 70,
    },
  },
  logo: {
    cursor: 'pointer',
    fontSize: 42,
    margin: 0,
    marginTop: theme.spacing(4),
    color: theme.palette.text.primary,
    [theme.breakpoints.down('md')]: {
      fontSize: 42,
    },
  },
  heading: {
    fontSize: 32,
    marginTop: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      fontSize: 32,
    },
  },
  subheading: {
    marginTop: 32,
    fontSize: 24,
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      marginTop: theme.spacing(4),
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
    marginBottom: theme.spacing(6),
    width: '100%',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(10),
    },
  },
  subpage: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(12),
    width: '100%',
  },
  buttonContainer: {
    marginTop: 48,
    [theme.breakpoints.down('sm')]: {
      marginLeft: 'auto',
      marginRight: 'auto',
      maxWidth: 'none',
    },
  },
  login: {
    margin: 0,
    width: 260,
    padding: theme.spacing(2),
    cursor: 'pointer',
    opacity: 1,
    transition: 'opacity 0.3s',
    '&:hover': {
      opacity: 0.6,
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
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
    borderRadius: 30,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#47B7B8',
    maxHeight: 700,
    overflow: 'hidden',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      borderRadius: 25,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(8),
    },
  },
  meetingImage: {
    display: 'block',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    margin: '0px auto',
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  meetingImageMobile: {
    display: 'block',
    paddingTop: theme.spacing(5),
    paddingLeft: theme.spacing(5),
    paddingRight: theme.spacing(5),
    margin: '0px auto',
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
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
  list: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'center',
      margin: '0px auto',
      maxWidth: 367,
    },
  },
  quote: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 24,
    },
  },
  largeText: {
    [theme.breakpoints.down('sm')]: {
      fontSize: 32,
    },
  },
}));

// <meta name="slack-app-id" content="A01E5A9263B" />
const description = 'A newtab page that gets you what you need when you need it.';

const App = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Head>
        <title>Kelp - A newtab page that gets you what you need when you need it</title>
        <meta name="description" content={description} />
        {/* Twitter */}
        <meta name="twitter:card" content="summary" key="twcard" />
        <meta name="twitter:creator" content="kelpnyc" key="twhandle" />

        {/* Open Graph */}
        <meta property="og:url" content="https://www.kelp.nyc" key="ogurl" />
        <meta
          property="og:image"
          content="https://www.kelp.nyc/images/overview.jpg"
          key="ogimage"
        />
        <meta property="og:site_name" content="Kelp" key="ogsitename" />
        <meta
          property="og:title"
          content="Kelp - Your information filtration system"
          key="ogtitle"
        />
        <meta property="og:description" content={description} key="ogdesc" />
      </Head>
      <style jsx global>{`
        html body {
          background-color: #faf5eb;
        }
      `}</style>
      <div className={classes.hero}>
        <Container maxWidth="md">
          <img className={classes.logoImage} src="/kelp.svg" alt="Kelp logo" />
          <Typography variant="h4" className={classes.logo}>
            Kelp
          </Typography>
          <Typography variant="h1" className={classes.heading}>
            A New Tab page that gets you what you need when you need it
          </Typography>
          <Typography className={classes.subheading}>
            Kelp automatically associates your webpages with your meetings and shows you the right
            links for your next meeting. Install Kelp to leave tags and folders behind, and switch
            to an organization system that adapts to the real world.
          </Typography>
        </Container>
        <Container className={classes.buttonContainer}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            className={classes.login}
            startIcon={<img src="/icons/install-white.svg" width="24" height="24" />}
            onClick={() => (window.location.pathname = '/install')}
            disableElevation={true}
          >
            Install Kelp
          </Button>
        </Container>
      </div>
      <Container maxWidth="lg">
        <div className={classes.meetingContainer}>
          <img src="images/meetings-large.svg" className={classes.meetingImage} />
          <img src="images/meetings-mobile.svg" className={classes.meetingImageMobile} />
        </div>
      </Container>
      <UiBlocks />
      <Container maxWidth="md" className={classes.bodyCopySection}>
        <Typography variant="h2" className={classes.largeText}>
          Your data is your data
        </Typography>
        <Container maxWidth="sm">
          <Typography>
            Kelp does not store your passwords or personal data. We take security seriously and
            apply experience from e-commerce, and healthcare data security. Kelp’s security
            practices include but are not limited to: static code analysis, static dependency
            checking, web vulnerability scanning, end-to-end encryption, and a bug bounty program.
          </Typography>
          <br />
          <List disablePadding className={classes.list}>
            <ListItem disableGutters>
              <div className={classes.emojiIcon}>💻</div>
              <ListItemText>
                Kelp is a chrome extension that runs entirely on your computer
              </ListItemText>
            </ListItem>
            <ListItem disableGutters>
              <div className={classes.emojiIcon}>🛑 </div>
              <ListItemText>Kelp does not send your data to third parties</ListItemText>
            </ListItem>
            <ListItem disableGutters>
              <div className={classes.emojiIcon}>🔐</div>
              <ListItemText>Kelp does not record your email or Google Profile</ListItemText>
            </ListItem>
            <ListItem disableGutters>
              <div className={classes.emojiIcon}>🛤</div>
              <ListItemText>Kelp does not include analytics or tracking tools</ListItemText>
            </ListItem>
          </List>
        </Container>
      </Container>
      <br />
      <Container maxWidth="md">
        <Grid container alignItems="center" justifyContent="center">
          <Grid
            sm={12}
            md={6}
            item
            className={clsx(classes.bodyCopySection, classes.loginButtonContainer)}
          >
            <Typography variant="h4" className={classes.quote}>
              Ready to get started?
            </Typography>
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                className={classes.login}
                startIcon={<img src="/icons/install-white.svg" width="24" height="24" />}
                onClick={() => (window.location.pathname = '/install')}
                disableElevation={true}
              >
                Install Kelp
              </Button>
            </div>
          </Grid>
          <Grid sm={12} md={6} item>
            <List disablePadding className={classes.list}>
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
      <br />
      <br />
      <Divider />
      <Footer />
    </div>
  );
};

export default App;
