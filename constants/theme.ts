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
      main: '#FF4600',
      dark: '#FF4600',
      contrastText: '#fff',
    },
    secondary: {
      light: '#FAF8F5',
      main: '#47B7B8',
      dark: '#47B7B8',
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
    fontSize: 14,
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
      fontSize: 20,
      fontStyle: 'normal',
      fontFamily: mediumFontFamily,
      fontWeight: 500,
      color: '#000',
    },
    h4: {
      fontSize: 16,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      fontWeight: 400,
      color: '#000',
    },
    h5: {
      fontSize: 16,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      color: 'rgba(0,0,0,0.5)',
    },
    h6: {
      fontSize: 14,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      color: 'rgba(0,0,0,0.5)',
      fontWeight: 400,
      textTransform: 'none',
      marginBottom: 12,
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
    MuiIconButton: {
      root: {
        color: '#000000',
        padding: 8,
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
        fontSize: 14,
        paddingTop: 4,
        paddingBottom: 4,
      },
    },
    MuiAvatar: {
      root: {
        height: 32,
        width: 32,
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
