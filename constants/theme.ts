import { Theme, ThemeOptions, createTheme } from '@mui/material/styles';
import BasisGrotesqueItalicWoff2 from '../public/fonts/basis-grotesque-italic-pro.woff2';
import BasisGrotesqueMediumWoff2 from '../public/fonts/basis-grotesque-medium-pro.woff2';
import BasisGrotesqueRegularWoff2 from '../public/fonts/basis-grotesque-regular-pro.woff2';
import config from './config';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line
  interface DefaultTheme extends Theme {}
}

const bodyFontFamily = "'basis-grotesque', sans-serif";
export const mediumFontFamily = "'basis-grotesque-medium', sans-serif";

const lightThemePalette = {
  mode: 'light',
  background: {
    paper: '#5f7c49',
    default: config.THEME_LIGHT_COLOR,
  },
  primary: {
    main: config.THEME_LIGHT_HIGHLIGHT_COLOR,
    dark: '#ffff01',
    contrastText: config.THEME_LIGHT_COLOR,
  },
  secondary: {
    main: config.THEME_LIGHT_HIGHLIGHT_COLOR,
    contrastText: config.THEME_LIGHT_COLOR,
  },
  error: {
    main: 'rgba(194, 15, 36, 1)',
    contrastText: 'rgba(255,255,255,0.87)',
  },
  text: {
    primary: 'rgba(255,255,255,0.87)',
    secondary: 'rgba(255,255,255,0.5)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(255,255,255,0.2)',
};

const coolThemePalette = {
  mode: 'light',
  background: {
    paper: '#9ac8de',
    default: config.THEME_COOL_COLOR,
  },
  primary: {
    main: config.THEME_COOL_HIGHLIGHT_COLOR,
    contrastText: config.THEME_COOL_COLOR,
  },
  secondary: {
    main: config.THEME_COOL_HIGHLIGHT_COLOR,
    contrastText: config.THEME_COOL_COLOR,
  },
  error: {
    main: 'rgba(194, 15, 36, 1)',
    contrastText: 'rgba(0,0,0,0.87)',
  },
  text: {
    primary: 'rgba(0,0,0,0.87)',
    secondary: 'rgba(0,0,0,0.5)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0,0,0,0.2)',
};

const darkPrimaryTextColor = 'rgba(255,255,255,0.87)';
const darkSecondaryTextColor = 'rgba(255, 255, 255, 0.50)';

const darkThemePalette = {
  mode: 'dark',
  background: {
    paper: '#50505A',
    default: config.THEME_DARK_COLOR,
  },
  primary: {
    main: config.THEME_DARK_HIGHLIGHT_COLOR,
    contrastText: '#fff',
  },
  secondary: {
    main: config.THEME_DARK_HIGHLIGHT_COLOR,
    contrastText: '#fff',
  },
  error: {
    main: 'rgba(194, 15, 36, 1)',
    contrastText: darkPrimaryTextColor,
  },
  text: {
    primary: darkPrimaryTextColor,
    secondary: darkSecondaryTextColor,
    disabled: 'rgba(255, 255, 255, 0.38)',
  },
  divider: 'rgba(255,255,255,0.2)',
};

const themeConfig = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  typography: {
    fontSize: 14,
    fontFamily: bodyFontFamily,
    fontWeightRegular: 400,
    h1: {
      fontFamily: bodyFontFamily,
      fontWeight: 400,
      fontStyle: 'normal',
      fontSize: '64px',
      lineHeight: '76.8px',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: bodyFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '40px',
      lineHeight: '48px',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: bodyFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '24px',
      lineHeight: '29px',
      letterSpacing: '-0.02em',
    },
    subtitle1: {
      fontFamily: bodyFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '24px',
      lineHeight: '29px',
    },
    subtitle2: {
      fontFamily: bodyFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14px',
      lineHeight: '140%',
      opacity: 0.5,
    },
    body1: {
      fontFamily: bodyFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '16px',
      lineHeight: '140%',
    },
    body2: {
      fontFamily: bodyFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14px',
      lineHeight: '140%',
    },
    button: {
      fontFamily: mediumFontFamily,
      fontStyle: 'normal',
      fontWeight: 'normal',
      fontSize: '14px',
      textTransform: 'capitalize',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
      @font-face {
        font-family: "basis-grotesque";
        font-style: "normal";
        font-display: 'swap';
        font-weight: 400;
        src: url(${BasisGrotesqueRegularWoff2}) format('woff2');
      }

      @font-face {
        font-family: 'basis-grotesque-italic';
        font-style: 'italic';
        font-display: 'swap';
        font-weight: 400;
        src: url(${BasisGrotesqueItalicWoff2}) format('woff2');
      }

      @font-face {
        font-family: 'basis-grotesque-medium',
        font-style: 'normal';
        font-display: 'swap';
        font-weight: 400;
        src: url(${BasisGrotesqueMediumWoff2}) format('woff2');
      }
      `,
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 6,
          paddingBottom: 6,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontFamily: mediumFontFamily,
          fontSize: 14,
          paddingTop: 4,
          paddingBottom: 4,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          height: 40,
          width: 40,
          fontSize: '1rem',
          textTransform: 'uppercase',
          color: '#fff',
          fontWeight: 500,
          fontFamily: mediumFontFamily,
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paperWidthSm: {
          width: '100%',
        },
        paperScrollPaper: {
          borderRadius: 16,
        },
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginTop: 5,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: { borderRadius: 28, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
        input: {
          padding: '10px',
          paddingTop: '​12px',
          paddingBottom: '​12px',
        },
        multiline: {
          padding: '16px 12px 16px 18px',
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
  },
} as ThemeOptions;

export const darkTheme = createTheme(themeConfig as any, { palette: darkThemePalette });
export const lightTheme = createTheme(themeConfig as any, { palette: lightThemePalette });
export const coolTheme = createTheme(themeConfig as any, { palette: coolThemePalette });
