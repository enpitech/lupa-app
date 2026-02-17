/**
 * Color Palette & Semantic Colors
 * 
 * Defines the app's color palette and semantic color names.
 * Use semantic colors in components for consistency and easy theming.
 */

// Base Color Palette
export const palette = {
  // Primary Colors
  primary100: '#E6F0FF',
  primary200: '#B3D4FF',
  primary300: '#80B8FF',
  primary400: '#4D9CFF',
  primary500: '#007AFF', // Main primary
  primary600: '#0062CC',
  primary700: '#004B99',
  primary800: '#003366',
  primary900: '#001A33',

  // Secondary Colors
  secondary100: '#F0F0F0',
  secondary200: '#E0E0E0',
  secondary300: '#C0C0C0',
  secondary400: '#A0A0A0',
  secondary500: '#808080',
  secondary600: '#606060',
  secondary700: '#404040',
  secondary800: '#202020',
  secondary900: '#000000',

  // Neutral Colors
  neutral100: '#FFFFFF',
  neutral200: '#F7F7F7',
  neutral300: '#E5E5E5',
  neutral400: '#D4D4D4',
  neutral500: '#A3A3A3',
  neutral600: '#737373',
  neutral700: '#525252',
  neutral800: '#404040',
  neutral900: '#171717',

  // Success Colors
  success100: '#D1FAE5',
  success200: '#A7F3D0',
  success300: '#6EE7B7',
  success400: '#34D399',
  success500: '#10B981',
  success600: '#059669',
  success700: '#047857',

  // Warning Colors
  warning100: '#FEF3C7',
  warning200: '#FDE68A',
  warning300: '#FCD34D',
  warning400: '#FBBF24',
  warning500: '#F59E0B',
  warning600: '#D97706',
  warning700: '#B45309',

  // Error Colors
  error100: '#FEE2E2',
  error200: '#FECACA',
  error300: '#FCA5A5',
  error400: '#F87171',
  error500: '#DC2626',
  error600: '#B91C1C',
  error700: '#991B1B',

  // Info Colors
  info100: '#DBEAFE',
  info200: '#BFDBFE',
  info300: '#93C5FD',
  info400: '#60A5FA',
  info500: '#3B82F6',
  info600: '#2563EB',
  info700: '#1D4ED8',

  // Overlay
  overlay20: 'rgba(0, 0, 0, 0.2)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
} as const;

// Semantic Colors - Use these in components
export const colors = {
  /**
   * The palette is available to use for custom color values.
   */
  palette,

  /**
   * A helper for making something see-thru.
   */
  transparent: 'transparent',

  /**
   * The default text color in many components.
   */
  text: palette.neutral900,
  textDim: palette.neutral600,
  textInverse: palette.neutral100,

  /**
   * The default background color of the app.
   */
  background: palette.neutral100,
  backgroundDim: palette.neutral200,

  /**
   * The default border color.
   */
  border: palette.neutral300,
  borderDim: palette.neutral200,

  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  tintInactive: palette.neutral400,

  /**
   * A subtle color used for lines and separators.
   */
  separator: palette.neutral300,

  /**
   * Error messages and destructive actions.
   */
  error: palette.error500,
  errorBackground: palette.error100,

  /**
   * Success messages and positive actions.
   */
  success: palette.success500,
  successBackground: palette.success100,

  /**
   * Warning messages.
   */
  warning: palette.warning500,
  warningBackground: palette.warning100,

  /**
   * Info messages.
   */
  info: palette.info500,
  infoBackground: palette.info100,
} as const;

export type ColorName = keyof typeof colors;
export type PaletteName = keyof typeof palette;
