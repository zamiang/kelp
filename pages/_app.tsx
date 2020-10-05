import { Auth0Provider } from '@auth0/auth0-react';
import CssBaseline from '@material-ui/core/CssBaseline';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React from 'react';
import config from '../constants/config';
import theme from '../constants/theme';

const App = (props: any) => {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }

    const scriptNode = document.createElement('script');
    scriptNode.src = 'https://apis.google.com/js/api.js';
    scriptNode.type = 'text/javascript';
    scriptNode.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(scriptNode);
  }, []);
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
