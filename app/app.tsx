import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import React, { useState } from 'react';
import { render } from 'react-dom';
import { useGoogleLogin } from 'react-google-login';
import Copyright from './copyright';
import DashboardContainer from './dashboard-container';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  centerPaper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
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
    <div className={classes.root}>
      <CssBaseline />
      {isLoggedIn ? (
        <DashboardContainer accessToken={googleLoginState.accessToken} />
      ) : (
        <Container component="main" maxWidth="xs">
          <Paper className={classes.centerPaper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Button variant="outlined" color="primary" onClick={signIn} className={classes.submit}>
              Sign In
            </Button>
          </Paper>
          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      )}
    </div>
  );
};

render(<App />, document.getElementById('root'));
