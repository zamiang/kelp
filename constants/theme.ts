import { createTheme } from '@material-ui/core/styles';
import BasisGrotesqueItalicWoff2 from '../public/fonts/basis-grotesque-italic-pro.woff2';
import BasisGrotesqueMediumWoff2 from '../public/fonts/basis-grotesque-medium-pro.woff2';
import BasisGrotesqueRegularWoff2 from '../public/fonts/basis-grotesque-regular-pro.woff2';

const bodyFontFamily = "'basis-grotesque', sans-serif";
export const mediumFontFamily = "'basis-grotesque-medium', sans-serif";
export const italicFontFamily = "'basis-grotesque-italic', sans-serif";

// 'linear-gradient(90deg, hsla(150, 60%, 98%, 1) 0%, hsla(40, 60%, 95%, 1) 100%)';
export const boxShadow = 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px';

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

const primaryTextColor = 'rgba(0,0,0,0.87)';
const secondaryTextColor = 'rgba(0, 0, 0, 0.70)';
const lightTextColor = 'rgba(0,0,0,0.5)';
export const lightGreyColor = 'rgba(0,0,0,0.08)';
const white = '#fff';
const black = '#000';

export const lightTheme = createTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application
    },
  },
  palette: {
    type: 'light',
    common: {
      black,
      white,
    },
    background: {
      paper: white,
      default: '#FBF2DD',
    },
    primary: {
      light: '#DEEBFF',
      main: '#FF4600',
      dark: '#FF4600',
      contrastText: white,
    },
    secondary: {
      light: '#faf5eb',
      main: '#47B7B8',
      dark: '#47B7B8',
      contrastText: white,
    },
    error: {
      light: 'rgba(245, 98, 0, 1)',
      main: 'rgba(194, 15, 36, 1)',
      dark: '#d32f2f',
      contrastText: white,
    },
    text: {
      primary: primaryTextColor,
      secondary: secondaryTextColor,
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: lightTextColor,
    },
  },
  shadows: [
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
  ],
  typography: {
    fontSize: 14,
    fontFamily: bodyFontFamily,
    fontWeightRegular: 400,
    color: primaryTextColor,
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
      color: primaryTextColor,
    },
    h4: {
      fontSize: 16,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      fontWeight: 400,
      lineHeight: 1.35,
      color: primaryTextColor,
    },
    h5: {
      fontSize: 16,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      color: lightTextColor,
    },
    h6: {
      fontSize: 14,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      color: lightTextColor,
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
      color: primaryTextColor,
    },
    body2: {
      fontFamily: bodyFontFamily,
      color: lightTextColor,
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
    shape: {
      borderRadius: 16,
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
        color: primaryTextColor,
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
        height: 34,
        width: 34,
        fontSize: '1rem',
        textTransform: 'uppercase',
        color: white,
        fontWeight: 500,
        fontFamily: mediumFontFamily,
      },
    },
    MuiAvatarGroup: {
      avatar: {
        borderColor: white,
        color: primaryTextColor,
      },
    },
    MuiDialog: {
      paperWidthSm: {
        minHeight: '90vh',
        width: '100%',
      },
    },
    MuiToggleButton: {
      root: {
        border: '0px solid',
        textTransform: 'none',
        lineHeight: 1.35,
        justifyContent: 'left',
      },
      label: {
        overflow: 'hidden',
        fontFamily: bodyFontFamily,
        color: primaryTextColor,
      },
    },
    MuiToggleButtonGroup: {
      groupedHorizontal: {
        '&:not(:last-child)': {
          borderRadius: 4,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
        },
        '&:not(:first-child)': {
          borderRopLeftRadius: 4,
          borderBottomLeftRadius: 4,
        },
      },
    },
    MuiFilledInput: {
      root: { borderRadius: 28, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
      input: {
        padding: '10px',
        paddingTop: '​12px',
        paddingBottom: '​12px',
      },
      multiline: {
        padding: '16px 12px 16px 18px',
        background: '#eee',
      },
      underline: {
        '&:before': {
          display: 'none',
        },
        '&:after': {
          display: 'none',
        },
      },
    },
  },
} as any);

const darkPrimaryTextColor = 'rgba(255,255,255,0.87)';
const darkSecondaryTextColor = 'rgba(255, 255, 255, 0.70)';
const darkLightTextColor = 'rgba(255,255,255,0.5)';

export const darkTheme = createTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application
    },
  },
  palette: {
    type: 'dark',
    background: {
      paper: '#3e3f54',
      default: '#262736',
    },
    primary: {
      light: '#DEEBFF',
      main: '#FF4600',
      dark: '#FF4600',
      contrastText: white,
    },
    secondary: {
      light: '#faf5eb',
      main: '#47B7B8',
      dark: '#47B7B8',
      contrastText: white,
    },
    error: {
      light: 'rgba(245, 98, 0, 1)',
      main: 'rgba(194, 15, 36, 1)',
      dark: '#d32f2f',
      contrastText: white,
    },
    text: {
      primary: darkPrimaryTextColor,
      secondary: darkSecondaryTextColor,
      disabled: 'rgba(255, 255, 255, 0.38)',
      hint: darkLightTextColor,
    },
  },
  shadows: [
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
    boxShadow,
  ],
  typography: {
    fontSize: 14,
    fontFamily: bodyFontFamily,
    fontWeightRegular: 400,
    color: darkPrimaryTextColor,
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
      color: darkPrimaryTextColor,
    },
    h4: {
      fontSize: 16,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      fontWeight: 400,
      lineHeight: 1.35,
      color: darkPrimaryTextColor,
    },
    h5: {
      fontSize: 16,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      color: darkLightTextColor,
    },
    h6: {
      fontSize: 14,
      fontStyle: 'normal',
      fontFamily: bodyFontFamily,
      color: darkLightTextColor,
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
      color: darkPrimaryTextColor,
    },
    body2: {
      fontFamily: bodyFontFamily,
      color: darkLightTextColor,
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
    shape: {
      borderRadius: 16,
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
        color: darkPrimaryTextColor,
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
        height: 34,
        width: 34,
        fontSize: '1rem',
        textTransform: 'uppercase',
        color: white,
        fontWeight: 500,
        fontFamily: mediumFontFamily,
      },
    },
    MuiAvatarGroup: {
      avatar: {
        borderColor: white,
        color: darkPrimaryTextColor,
      },
    },
    MuiDialog: {
      paperWidthSm: {
        minHeight: '90vh',
        width: '100%',
      },
    },
    MuiToggleButton: {
      root: {
        border: '0px solid',
        textTransform: 'none',
        lineHeight: 1.35,
        justifyContent: 'left',
      },
      label: {
        overflow: 'hidden',
        fontFamily: bodyFontFamily,
        color: darkPrimaryTextColor,
      },
    },
    MuiToggleButtonGroup: {
      groupedHorizontal: {
        '&:not(:last-child)': {
          borderRadius: 4,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
        },
        '&:not(:first-child)': {
          borderRopLeftRadius: 4,
          borderBottomLeftRadius: 4,
        },
      },
    },
    MuiFilledInput: {
      root: { borderRadius: 28, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
      input: {
        padding: '10px',
        paddingTop: '​12px',
        paddingBottom: '​12px',
      },
      multiline: {
        padding: '16px 12px 16px 18px',
        background: '#111',
      },
      underline: {
        '&:before': {
          display: 'none',
        },
        '&:after': {
          display: 'none',
        },
      },
    },
  },
} as any);
