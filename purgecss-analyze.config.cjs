const path = require('path');
const fs = require('fs');

module.exports = {
  content: [
    // TypeScript/JavaScript source files
    './extension/src/**/*.{ts,tsx,js,jsx}',

    // HTML templates
    './extension/public/**/*.html',

    // Component files from parent directory
    './components/**/*.{ts,tsx,js,jsx}',

    // Include any dynamically generated class patterns
    {
      raw: `
        theme-light theme-dark theme-auto
        fade-in slide-in loading-spinner
        sr-only visually-hidden theme-changing
      `,
      extension: 'html',
    },
  ],

  css: [
    // All CSS files in the extension
    './extension/src/**/*.css',
    './extension/dist/*.css', // If you want to analyze built CSS
  ],

  // Output configuration for analysis
  output: './css-analysis/',

  // Keep rejected CSS for analysis
  rejected: true,
  rejectedCss: true,

  // Safelist configuration (what to always keep)
  safelist: [
    // CSS Variables
    /^--color-/,
    /^--spacing-/,
    /^--font-/,
    /^--radius-/,
    /^--shadow-/,
    /^--transition-/,
    /^--theme-/,

    // Theme classes
    /^theme-/,
    /^data-theme/,

    // Animation classes
    /^fade-/,
    /^slide-/,
    /^animate-/,

    // Utility classes
    /^loading/,
    /^spinner/,
    /^sr-only/,
    /^visually-hidden/,

    // State classes
    /^is-/,
    /^has-/,
    /^active/,
    /^disabled/,
    /^selected/,
    /^hover/,
    /^focus/,

    // Responsive classes
    /^sm:/,
    /^md:/,
    /^lg:/,
    /^xl:/,

    // Material-UI components
    /^Mui/,
    /^MuiButton/,
    /^MuiDialog/,
    /^MuiTextField/,
    /^MuiTypography/,
    /^MuiBox/,
    /^MuiPaper/,
    /^MuiCard/,
    /^MuiList/,
    /^MuiMenuItem/,
    /^MuiIconButton/,
    /^MuiChip/,
    /^MuiAvatar/,
    /^MuiDivider/,
    /^MuiTooltip/,
    /^MuiPopover/,
    /^MuiMenu/,
    /^MuiGrid/,
    /^MuiContainer/,

    // Emotion CSS (Material-UI's CSS-in-JS)
    /^css-/,

    // Your custom component patterns
    /^kelp-/,
    /^extension-/,

    // Partial matches
    /button/,
    /modal/,
    /tooltip/,
    /dropdown/,
  ],

  // Extractor for better class detection
  defaultExtractor: (content) => {
    // Enhanced extractor for various class name patterns
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];

    // Extract potential class names from JSX className props
    const classNameMatches = content.match(/className=["']([^"']+)["']/g) || [];
    const classNames = classNameMatches.flatMap((match) => {
      const classes = match.replace(/className=["']|["']/g, '');
      return classes.split(/\s+/);
    });

    // Extract from template literals
    const templateLiteralMatches = content.match(/`[^`]*`/g) || [];
    const templateClasses = templateLiteralMatches.flatMap((match) => {
      return match.replace(/`/g, '').split(/\s+/);
    });

    // Extract from CSS modules usage
    const cssModuleMatches = content.match(/styles\.\w+/g) || [];
    const moduleClasses = cssModuleMatches.map((match) => match.replace('styles.', ''));

    // Extract from classes object pattern
    const classesMatches = content.match(/classes\.\w+/g) || [];
    const classesClasses = classesMatches.map((match) => match.replace('classes.', ''));

    return [
      ...broadMatches,
      ...innerMatches,
      ...classNames,
      ...templateClasses,
      ...moduleClasses,
      ...classesClasses,
    ].filter(Boolean);
  },

  // Font face rules
  fontFace: true,

  // Keep all keyframes initially for analysis
  keyframes: true,

  // Variables
  variables: true,

  // Output rejected selectors to file
  rejectedCss: true,
};
