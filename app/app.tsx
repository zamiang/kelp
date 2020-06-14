import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useState } from 'react';
import { render } from 'react-dom';
import { useGoogleLogin } from 'react-google-login';
import Copyright from './copyright';
import DashboardContainer from './dashboard-container';
import headerImage from './images/designer_file_case.png';

const bodyFontFamily = 'Arial, sans-serif;';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#EDF1F2' },
    secondary: { main: '#7D58FE' },
  },
  typography: {
    fontFamily: "'Helvetica Neue', sans-serif;",
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
  image: {
    maxWidth: 210,
  },
}));

// Note: Lots more info on this object but is unused by the app
const initialGoogleState = {
  accessToken: '',
};

export type googleState = typeof initialGoogleState;

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

  const [googleLoginState, setGoogleLoginState] = useState(initialGoogleState);
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

  // ideal render path
  // create-store => (fetch first) => (fetch second) => get store back => render dashboard
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        {isLoggedIn ? (
          <DashboardContainer accessToken={googleLoginState.accessToken} />
        ) : (
          <Container component="main" maxWidth="sm">
            <Paper elevation={0} className={classes.centerPaper}>
              <img src={headerImage} className={classes.image} />
              <Typography variant="h1">Time</Typography>
              <Typography variant="body2" className={classes.body}>
                Time brings your data together in one place. Pivot your meetings by what documents
                the attendees have edited recently. By associating person, a time slot and documents
                together, Time infers associations between information, making the information
                easier to find. Prepare for your next meeting in a flash!
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={signIn}
                className={classes.submit}
              >
                Log In
              </Button>
            </Paper>
            <Typography variant="body2" className={classes.hint}>
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

render(<App />, document.getElementById('root'));
