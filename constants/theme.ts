import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const bodyFontFamily = "'Inter', sans-serif";

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
      light: '#FAF7FE',
      main: '#6200EE',
      dark: '#303f9f',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ddf7ff',
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
      fontWeight: 500,
      fontStyle: 'normal',
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
      fontWeight: 500,
    },
  },
  overrides: {
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
        fontWeight: 600,
      },
    },
    MuiAvatar: {
      root: {
        height: 30,
        width: 30,
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
