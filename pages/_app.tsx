import { Auth0Provider } from '@auth0/auth0-react';
import CssBaseline from '@material-ui/core/CssBaseline';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React from 'react';
import config from '../components/config';
import theme from '../components/theme';

const App = (props: any) => {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  /*
  React.useEffect(() => {
    const loadLibraries = () => {
      console.log('loading google libs');
      return gapi.client.init({
        discoveryDocs: [
          'https://www.googleapis.com/discovery/v1/apis/people/v1/rest',
          'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
          'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
          'https://www.googleapis.com/discovery/v1/apis/driveactivity/v2/rest',
          'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
        ],
      });
    };
    // load libraries is callback style
    gapi.load('client', loadLibraries as any);
  });
*/
  return (
    <React.Fragment>
      <Auth0Provider
        domain={config.AUTH0_DOMAIN}
        clientId={config.AUTH0_CLIENT_ID}
        redirectUri={config.AUTH0_REDIRECT_URI}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </Auth0Provider>
    </React.Fragment>
  );
};

export default App;
