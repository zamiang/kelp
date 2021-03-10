import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';
import BasisGrotesqueItalicWoff2 from '../public/fonts/basis-grotesque-italic-pro.woff2';
import BasisGrotesqueMediumWoff2 from '../public/fonts/basis-grotesque-medium-pro.woff2';
import BasisGrotesqueRegularWoff2 from '../public/fonts/basis-grotesque-regular-pro.woff2';

const bodyFontFamily = "'basis-grotesque', sans-serif";
export const mediumFontFamily = "'basis-grotesque-medium', sans-serif";
const italicFontFamily = "'basis-grotesque-italic', sans-serif";

const basisRegular = {
  fontFamily: 'basis-grotesque',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `url(${BasisGrotesqueRegularWoff2}) format('woff2')`,
};
const basisItalic = {
  fontFamily: 'basis-grotesque-italic',
  fontStyle: 'italic',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `url(${BasisGrotesqueItalicWoff2}) format('woff2')`,
};

const basisMedium = {
  fontFamily: 'basis-grotesque-medium',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
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
      light: '#DEEBFF',
      main: '#0052CC',
      dark: '#0052CC',
      contrastText: '#fff',
    },
    secondary: {
      light: '#FAF8F5',
      main: '#FF4601',
      dark: '#FF4601',
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
  },
  typography: {
    fontSize: 13,
    fontFamily: bodyFontFamily,
    fontWeightRegular: 400,
    h1: {
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '1.875rem',
    },
    h2: {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    h3: {
      fontWeight: 400,
      fontStyle: 'normal',
    },
    h5: {
      fontSize: '1.875rem',
      fontStyle: 'normal',
      fontFamily: mediumFontFamily,
    },
    h6: {
      fontSize: '0.875rem',
      color: 'rgba(0,0,0,0.5)',
      fontWeight: 400,
      textTransform: 'none',
      fontStyle: 'normal',
      lineHeight: '28px',
    },
    subtitle1: {
      fontFamily: bodyFontFamily,
    },
    subtitle2: {
      fontFamily: bodyFontFamily,
    },
    body1: {
      fontFamily: bodyFontFamily,
      fontSize: '14px',
      color: '#000000',
    },
    body2: {
      fontFamily: bodyFontFamily,
      color: 'rgba(0,0,0,0.5)',
      fontSize: '14px',
    },
    caption: {
      fontFamily: bodyFontFamily,
    },
    overline: {
      fontFamily: bodyFontFamily,
    },
    button: {
      fontFamily: mediumFontFamily,
      fontWeight: 500,
    },
    em: {
      fontFamily: italicFontFamily,
    },
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [basisRegular, basisItalic, basisMedium],
      },
    },
    MuiListItemIcon: {
      root: {
        minWidth: 0,
      },
    },
    MuiSvgIcon: {
      root: {
        fill: '#000000',
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
        fontFamily: mediumFontFamily,
      },
    },
    MuiAvatar: {
      root: {
        height: 30,
        width: 30,
        fontSize: '1rem',
        textTransform: 'uppercase',
        color: '#ffffff',
        fontWeight: 500,
        fontFamily: mediumFontFamily,
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
