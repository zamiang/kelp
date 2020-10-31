import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const bodyFontFamily = "'-apple-system', Arial, sans-serif;";

const theme = createMuiTheme({
  palette: {
    common: {
      black: '#000',
      white: '#fff',
    },
    background: {
      paper: '#fff',
      default: 'rgba(41, 206, 255, 1)',
    },
    primary: {
      light: 'rgba(29, 215, 212, 1)',
      main: 'rgba(10, 126, 194, 1)',
      dark: '#303f9f',
      contrastText: '#fff',
    },
    secondary: {
      light: 'rgba(196, 211, 217, 1)',
      main: 'rgba(116, 124, 129, 1)',
      dark: 'rgba(20, 21, 21, 1)',
      contrastText: '#fff',
    },
    error: {
      light: 'rgba(245, 98, 0, 1)',
      main: 'rgba(194, 15, 36, 1)',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.70)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    // primary: { main: config.BLUE_BACKGROUND, dark: '#0d2f81' },
    // secondary: { main: '#e8eaf6', light: '#ffffff', dark: '#b6b8c3' },
    // info: { main: '#D6F9F5' },
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
  overrides: {
    MuiListItemIcon: {
      root: {
        paddingRight: 8,
        minWidth: 0,
      },
    },
  },
});

export default responsiveFontSizes(theme);
