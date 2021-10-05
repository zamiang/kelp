import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import ThemeProvider from '@mui/styles/ThemeProvider';
import React, { useEffect } from 'react';
import homepageTheme from '../constants/homepage-theme';

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
