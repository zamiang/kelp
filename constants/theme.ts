import { createMuiTheme } from '@material-ui/core/styles';

const bodyFontFamily = "'-apple-system', Arial, sans-serif;";

const theme = createMuiTheme({
  palette: {
    primary: { main: '#2aceff', dark: '#0d2f81' },
    secondary: { main: '#e8eaf6', light: '#ffffff', dark: '#b6b8c3' },
    info: { main: '#D6F9F5' },
    text: {
      secondary: 'rgba(0, 0, 0, 0.70)',
    }
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

export default theme;
