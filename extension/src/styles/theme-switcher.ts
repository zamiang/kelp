/* Theme Switching Utility - Enhanced with Theme Bridge */

import { type ThemeName, syncThemeSystems } from './theme-bridge';

export type { ThemeName };

/**
 * Sets the theme by updating both CSS custom properties and data-theme attribute
 * @param theme - The theme name to apply
 * @param onMaterialUIThemeChange - Optional callback for Material-UI theme updates
 */
export const setTheme = (
  theme: ThemeName,
  onMaterialUIThemeChange?: (themeConfig: any) => void,
): void => {
  // Add theme-changing class to prevent transition flashing
  document.documentElement.classList.add('theme-changing');

  // Set the data-theme attribute
  document.documentElement.setAttribute('data-theme', theme);

  // Sync both CSS custom properties and Material-UI theme
  syncThemeSystems(theme, onMaterialUIThemeChange);

  // Remove theme-changing class after a brief delay
  setTimeout(() => {
    document.documentElement.classList.remove('theme-changing');
  }, 50);
};

/**
 * Gets the current theme from the document element
 * @returns The current theme name or null if no theme is set
 */
export const getCurrentTheme = (): ThemeName | null => {
  const theme = document.documentElement.getAttribute('data-theme');
  return theme as ThemeName | null;
};

/**
 * Detects the user's system theme preference
 * @returns 'dark' or 'light' based on system preference
 */
export const getSystemTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Initializes the theme system
 * @param defaultTheme - The default theme to use if none is stored
 */
export const initializeTheme = async (defaultTheme: ThemeName = 'dark'): Promise<void> => {
  try {
    // Try to get theme from Chrome storage first
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.sync.get('theme');
      const storedTheme = result.theme as ThemeName;

      if (storedTheme && ['dark', 'light', 'cool', 'nb'].includes(storedTheme)) {
        setTheme(storedTheme);
        return;
      }
    }

    // Fallback to localStorage
    const localTheme = localStorage.getItem('theme') as ThemeName;
    if (localTheme && ['dark', 'light', 'cool', 'nb'].includes(localTheme)) {
      setTheme(localTheme);
      return;
    }

    // Use default theme
    setTheme(defaultTheme);
  } catch (error) {
    console.warn('Failed to initialize theme:', error);
    setTheme(defaultTheme);
  }
};

/**
 * Saves the theme preference to storage
 * @param theme - The theme to save
 */
export const saveTheme = async (theme: ThemeName): Promise<void> => {
  try {
    // Save to Chrome storage if available
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.sync.set({ theme });
    }

    // Also save to localStorage as fallback
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.warn('Failed to save theme:', error);
    // Fallback to localStorage only
    localStorage.setItem('theme', theme);
  }
};

/**
 * Switches to a new theme and saves the preference
 * @param theme - The theme to switch to
 */
export const switchTheme = async (theme: ThemeName): Promise<void> => {
  setTheme(theme);
  await saveTheme(theme);
};

/**
 * Toggles between dark and light themes
 */
export const toggleDarkMode = async (): Promise<void> => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  await switchTheme(newTheme);
};

/**
 * Listens for system theme changes and updates accordingly
 * @param callback - Optional callback to run when system theme changes
 */
export const watchSystemTheme = (callback?: (theme: 'dark' | 'light') => void): (() => void) => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {}; // Return empty cleanup function
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = (e: MediaQueryListEvent) => {
    const systemTheme = e.matches ? 'dark' : 'light';

    // Only auto-switch if user hasn't set a custom theme
    const currentTheme = getCurrentTheme();
    if (!currentTheme || currentTheme === 'dark' || currentTheme === 'light') {
      setTheme(systemTheme);
    }

    callback?.(systemTheme);
  };

  mediaQuery.addEventListener('change', handleChange);

  // Return cleanup function
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};

/**
 * Gets all available theme names
 * @returns Array of available theme names
 */
export const getAvailableThemes = (): ThemeName[] => ['dark', 'light', 'cool', 'nb'];

/**
 * Gets theme display names for UI
 * @returns Object mapping theme names to display names
 */
export const getThemeDisplayNames = (): Record<ThemeName, string> => ({
  dark: 'Dark',
  light: 'Light',
  cool: 'Cool',
  nb: 'Notebook',
});
