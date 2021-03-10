import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import BasisGrotesqueItalicWoff2 from '../public/fonts/basis-grotesque-italic-pro.woff2';
import BasisGrotesqueMediumWoff2 from '../public/fonts/basis-grotesque-medium-pro.woff2';
import BasisGrotesqueRegularWoff2 from '../public/fonts/basis-grotesque-regular-pro.woff2';

const bodyFontFamily = "'basis-grotesque', sans-serif";

const basisRegular = {
  fontFamily: 'basis-grotesque',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `url(${BasisGrotesqueRegularWoff2}) format('woff2')`,
};
const basisItalic = {
  fontFamily: 'basis-grotesque',
  fontStyle: 'italic',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `url(${BasisGrotesqueItalicWoff2}) format('woff2')`,
};

const basisMedium = {
  fontFamily: 'basis-grotesque',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 500,
  src: `url(${BasisGrotesqueMediumWoff2}) format('woff2')`,
};

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application
    },
  },
  palette: {
    common: {
      black: '#000',
      white: '#fff',
    },
    background: {
      paper: '#fff',
      default: '#fff',
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
    fontFamily: bodyFontFamily,
    fontWeightRegular: 400,
    h1: {
      fontWeight: 400,
      fontFamily: 'reason-new, sans-serif',
      fontStyle: 'normal',
    },
    h2: {
      fontWeight: 400,
      fontFamily: 'reason-new, sans-serif',
      fontStyle: 'normal',
    },
    h3: {
      fontWeight: 400,
      fontFamily: 'reason-new, sans-serif',
      fontStyle: 'normal',
    },
    h5: {
      fontSize: '1.875rem',
      fontWeight: 500,
      fontFamily: 'reason-new, sans-serif',
      fontStyle: 'normal',
    },
    h6: {
      fontSize: '0.875rem',
      // color: theme.palette.primary.dark,
      fontWeight: 400,
      textTransform: 'none',
      fontStyle: 'normal',
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
      fontWeight: 500,
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [basisRegular, basisMedium, basisItalic],
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 0,
      },
    },
    MuiListItem: {
      root: {
        paddingTop: 6,
        paddingBottom: 6,
      },
    },
    MuiButton: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    MuiAvatar: {
      root: {
        height: 36,
        width: 36,
        fontSize: '1rem',
        textTransform: 'uppercase',
        color: '#ffffffcf',
      },
    },
    MuiAvatarGroup: {
      avatar: {
        borderColor: '#fff',
        color: 'rgba(0, 0, 0, 0.87)',
      },
    },
  },
} as any);

export default responsiveFontSizes(theme);
