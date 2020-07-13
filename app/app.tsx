import {
  Box,
  Button,
  Container,
  CssBaseline,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import clsx from 'clsx';
import React, { useState } from 'react';
import { render } from 'react-dom';
import { useGoogleLogin } from 'react-google-login';
import { hot } from 'react-hot-loader/root';
import config from './config';
import Copyright from './copyright';
import DashboardContainer from './dashboard-container';
// import DashboardContainer from './dashboard-fake-container';

const bodyFontFamily = "'-apple-system', Arial, sans-serif;";

const theme = createMuiTheme({
  palette: {
    primary: { main: '#EDF1F2', light: '#F6F6FE' },
    secondary: { main: '#7D58FE', light: '#ECE7FE' },
    info: { main: '#D6F9F5' },
  },
  typography: {
    fontSize: 13,
    fontFamily: "'-apple-system', 'Helvetica Neue', sans-serif;",
    fontWeightRegular: 500,
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: bodyFontFamily,
    },
    subtitle2: {
      fontFamily: bodyFontFamily,
    },
    body1: {
      fontFamily: bodyFontFamily,
    },
    body2: {
      fontFamily: bodyFontFamily,
    },
    caption: {
      fontFamily: bodyFontFamily,
    },
    overline: {
      fontFamily: bodyFontFamily,
    },
    button: {
      fontWeight: 700,
    },
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  centerPaper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(6, 8, 6, 8),
  },
  submit: {
    margin: theme.spacing(4, 0, 2),
    padding: theme.spacing(2, 6),
    borderRadius: 25,
  },
  avatar: {
    margin: theme.spacing(1),
  },
  body: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.primary,
  },
  hint: {
    marginTop: theme.spacing(2),
    color: theme.palette.text.hint,
  },
  logoImage: {
    width: 119,
    marginLeft: -10,
    marginRight: -8,
  },
  logoContainer: {
    marginLeft: -86,
  },
  container: {
    /* Modified from: https://dribbble.com/shots/2766518-Designer-s-Folder-illustration */
    // backgroundImage: `url(${config.DOMAIN}/images/designer_file_case.png)`,
    // backgroundSize: unset;
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },
}));

// Note: Lots more info on this object but is unused by the app
const getInitialGoogleState = () =>
  gapi && gapi.auth ? { accessToken: gapi.auth.getToken().access_token } : { accessToken: '' };

const loadLibraries = () =>
  gapi.client.init({
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
      'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
      'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    ],
  });

// load libraries is callback style
gapi.load('client', loadLibraries as any);

const App = () => {
  const classes = useStyles();
  const [googleLoginState, setGoogleLoginState] = useState(getInitialGoogleState());
  const { signIn } = useGoogleLogin({
    // TODO: Handle GoogleOfflineResponse and remove response: any
    onSuccess: (response: any) => setGoogleLoginState(response),
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
  const isLoggedIn = googleLoginState.accessToken.length > 0;
  return (
    <ThemeProvider theme={theme}>
      <div className={clsx(classes.root, !isLoggedIn && classes.container)}>
        <CssBaseline />
        {isLoggedIn ? (
          <DashboardContainer accessToken={googleLoginState.accessToken} />
        ) : (
          <Container component="main" maxWidth="sm">
            <Paper elevation={0} className={classes.centerPaper}>
              <ListItem className={classes.logoContainer}>
                <ListItemIcon>
                  <img className={classes.logoImage} src={`${config.DOMAIN}/images/kelp.svg`} />
                </ListItemIcon>
                <ListItemText disableTypography={true}>
                  <Typography variant="h1">Kelp</Typography>
                  <Typography variant="subtitle1" style={{ fontStyle: 'italic' }}>
                    Your information filtration system
                  </Typography>
                </ListItemText>
              </ListItem>
              <Typography variant="body1" className={classes.body}>
                Kelp brings your data together in one place. Pivot your meetings by what documents
                the attendees have edited recently. By associating person, a time slot and documents
                together, Kelp infers associations between information, making the information
                easier to find. Prepare for your next meeting in a flash!
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={signIn}
                className={classes.submit}
              >
                Log In with Google
              </Button>
            </Paper>
            <Typography variant="body1" className={classes.hint}>
              This application does not store your data or send your data to any third parties. Your
              browser retrieves your data directly from the Google API and processes the data on
              your computer.
            </Typography>
            <Box mt={8}>
              <Copyright />
            </Box>
          </Container>
        )}
      </div>
    </ThemeProvider>
  );
};

const HotApp = hot(App);

render(<HotApp />, document.getElementById('root'));
