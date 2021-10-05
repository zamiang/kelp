import { CacheProvider } from '@emotion/react';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeProvider from '@mui/styles/ThemeProvider';
import React from 'react';
import createEmotionCache from '../components/styles/create-emotion-cache';
import homepageTheme from '../constants/homepage-theme';

const clientSideEmotionCache = createEmotionCache();

const App = (props: any) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={homepageTheme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App;
