import CssBaseline from '@material-ui/core/CssBaseline';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React, { useEffect } from 'react';
import homepageTheme from '../constants/homepage-theme';
import theme from '../constants/theme';

const App = (props: any) => {
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);
  const isDashboard = props.router.route.includes('/dashboard');
  return (
    <ThemeProvider theme={isDashboard ? theme : homepageTheme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default App;
