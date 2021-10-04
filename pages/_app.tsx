import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import ThemeProvider from '@mui/styles/ThemeProvider';
import React, { useEffect } from 'react';
import homepageTheme from '../constants/homepage-theme';

/*
* Uncomment to test accessbility
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line
  const ReactDOM = require('react-dom');
  // eslint-disable-next-line
  const axe = require('@axe-core/react');
  axe(React, ReactDOM, 1000);
}
*/

const App = (props: any) => {
  const { Component, pageProps } = props;

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={homepageTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
