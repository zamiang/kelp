import CssBaseline from '@material-ui/core/CssBaseline';
import { createMuiTheme } from '@material-ui/core/styles';
import ThemeProvider from '@material-ui/styles/ThemeProvider';
import React from 'react';

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

const App = (props: any) => {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);
  return (
    <React.Fragment>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
