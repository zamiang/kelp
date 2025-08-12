/* Theme Bridge Utility - Synchronizes Material-UI themes with CSS custom properties */

import config from '../../../constants/config';

export type ThemeName = 'dark' | 'light' | 'cool' | 'nb';

/**
 * Theme color mappings from config to CSS custom properties
 */
export const themeColorMappings: Record<
  ThemeName,
  {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: string;
    divider: string;
  }
> = {
  dark: {
    background: config.THEME_DARK_COLOR,
    surface: '#50505a',
    primary: config.THEME_DARK_HIGHLIGHT_COLOR,
    secondary: config.THEME_DARK_HIGHLIGHT_COLOR,
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.38)',
    },
    border: 'rgba(255, 255, 255, 0.12)',
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  light: {
    background: config.THEME_LIGHT_COLOR,
    surface: '#5f7c49',
    primary: config.THEME_LIGHT_HIGHLIGHT_COLOR,
    secondary: config.THEME_LIGHT_HIGHLIGHT_COLOR,
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.5)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    border: 'rgba(255, 255, 255, 0.2)',
    divider: 'rgba(255, 255, 255, 0.2)',
  },
  cool: {
    background: config.THEME_COOL_COLOR,
    surface: '#9ac8de',
    primary: config.THEME_COOL_HIGHLIGHT_COLOR,
    secondary: config.THEME_COOL_HIGHLIGHT_COLOR,
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.5)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    border: 'rgba(0, 0, 0, 0.2)',
    divider: 'rgba(0, 0, 0, 0.2)',
  },
  nb: {
    background: config.THEME_NB_COLOR,
    surface: 'rgb(229,218,204)',
    primary: config.THEME_NB_HIGHLIGHT_COLOR,
    secondary: config.THEME_NB_HIGHLIGHT_COLOR,
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.5)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    border: 'rgba(0, 0, 0, 0.2)',
    divider: 'rgba(0, 0, 0, 0.2)',
  },
};

/**
 * Updates CSS custom properties to match the specified theme
 * @param theme - The theme name to apply
 */
export const updateCSSCustomProperties = (theme: ThemeName): void => {
  const themeColors = themeColorMappings[theme];
  const root = document.documentElement;

  // Update CSS custom properties
  root.style.setProperty('--color-background', themeColors.background);
  root.style.setProperty('--color-surface', themeColors.surface);
  root.style.setProperty('--color-primary', themeColors.primary);
  root.style.setProperty('--color-secondary', themeColors.secondary);
  root.style.setProperty('--color-text-primary', themeColors.text.primary);
  root.style.setProperty('--color-text-secondary', themeColors.text.secondary);
  root.style.setProperty('--color-text-disabled', themeColors.text.disabled);
  root.style.setProperty('--color-border', themeColors.border);
  root.style.setProperty('--color-divider', themeColors.divider);

  // Update theme-specific shadows for dark theme
  if (theme === 'dark') {
    root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.3)');
    root.style.setProperty(
      '--shadow-md',
      '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    );
    root.style.setProperty(
      '--shadow-lg',
      '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
    );
  } else {
    // Reset to default light shadows
    root.style.setProperty('--shadow-sm', '0 1px 2px 0 rgba(0, 0, 0, 0.05)');
    root.style.setProperty(
      '--shadow-md',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    );
    root.style.setProperty(
      '--shadow-lg',
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    );
  }
};

/**
 * Creates a Material-UI theme object that uses CSS custom properties
 * @param theme - The theme name
 * @returns Material-UI theme configuration
 */
export const createMaterialUIThemeConfig = (theme: ThemeName) => {
  const themeColors = themeColorMappings[theme];
  const isDark = theme === 'dark';

  return {
    palette: {
      mode: isDark ? 'dark' : 'light',
      background: {
        default: themeColors.background,
        paper: themeColors.surface,
      },
      primary: {
        main: themeColors.primary,
        contrastText: isDark ? '#fff' : themeColors.background,
      },
      secondary: {
        main: themeColors.secondary,
        contrastText: isDark ? '#fff' : themeColors.background,
      },
      error: {
        main: 'rgba(194, 15, 36, 1)',
        contrastText: isDark ? 'rgba(255,255,255,0.87)' : 'rgba(0,0,0,0.87)',
      },
      text: {
        primary: themeColors.text.primary,
        secondary: themeColors.text.secondary,
        disabled: themeColors.text.disabled,
      },
      divider: themeColors.divider,
      // Add common colors that Material-UI expects
      common: {
        black: '#000',
        white: '#fff',
      },
      // Add grey palette for Material-UI components
      grey: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#eeeeee',
        300: '#e0e0e0',
        400: '#bdbdbd',
        500: '#9e9e9e',
        600: '#757575',
        700: '#616161',
        800: '#424242',
        900: '#212121',
        A100: '#f5f5f5',
        A200: '#eeeeee',
        A400: '#bdbdbd',
        A700: '#616161',
      },
    },
  };
};

/**
 * Gets the current theme from CSS custom properties
 * @returns The current theme name based on background color
 */
export const getCurrentThemeFromCSS = (): ThemeName => {
  const root = document.documentElement;
  const currentBg = getComputedStyle(root).getPropertyValue('--color-background').trim();

  // Match background color to theme
  for (const [themeName, colors] of Object.entries(themeColorMappings)) {
    if (colors.background === currentBg) {
      return themeName as ThemeName;
    }
  }

  // Default fallback
  return 'dark';
};

/**
 * Synchronizes both CSS custom properties and Material-UI theme
 * @param theme - The theme to apply
 * @param onMaterialUIThemeChange - Callback to update Material-UI theme
 */
export const syncThemeSystems = (
  theme: ThemeName,
  onMaterialUIThemeChange?: (themeConfig: any) => void,
): void => {
  // Update CSS custom properties
  updateCSSCustomProperties(theme);

  // Update Material-UI theme if callback provided
  if (onMaterialUIThemeChange) {
    const materialUIConfig = createMaterialUIThemeConfig(theme);
    onMaterialUIThemeChange(materialUIConfig);
  }
};

/**
 * Gets all available themes with their display names and colors
 */
export const getThemeInfo = () => ({
  themes: Object.keys(themeColorMappings) as ThemeName[],
  displayNames: {
    dark: 'Dark',
    light: 'Light',
    cool: 'Cool',
    nb: 'Notebook',
  } as Record<ThemeName, string>,
  colors: themeColorMappings,
});
