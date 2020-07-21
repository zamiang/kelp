import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme, makeStyles } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import clsx from 'clsx';
import React, { useState } from 'react';
import { render } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { Redirect, Route, HashRouter as Router, Switch } from 'react-router-dom';
import Homepage from './homepage/homepage';
import DashboardContainer from './loadable-dashboard';
// import DashboardContainer from './dashboard-fake-container';

const bodyFontFamily = "'-apple-system', Arial, sans-serif;";

const theme = createMuiTheme({
  palette: {
    primary: { main: '#0061ff', dark: '#0d2f81' },
    secondary: { main: '#e8eaf6', light: '#ffffff', dark: '#b6b8c3' },

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

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
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
  gapi && gapi.auth && gapi.auth.getToken()
    ? { accessToken: gapi.auth.getToken().access_token }
    : { accessToken: '' };

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
  const isLoggedIn = googleLoginState.accessToken.length > 0;
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className={clsx(classes.root, !isLoggedIn && classes.container)}>
          <CssBaseline />
          <Switch>
            <Route path="/dashboard/meetings">
              {isLoggedIn ? <DashboardContainer /> : <Redirect to="/" />}
            </Route>
            <Route path="/about">About</Route>
            <Route path="/contact">Contact</Route>
            <Route path="/terms">Terms</Route>
            <Route path="">
              {isLoggedIn ? (
                <Redirect to="/dashboard/meetings" />
              ) : (
                <Homepage setGoogleLoginState={setGoogleLoginState} />
              )}
            </Route>
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
};

const HotApp = hot(App);

render(<HotApp />, document.getElementById('root'));
