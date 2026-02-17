/**
 * Typography System
 * 
 * Defines font families, sizes, line heights, and weights.
 * Use these presets in Text components for consistent typography.
 */

import { Platform } from 'react-native';

// Font Families
export const fontFamilies = {
  /**
   * Default font family for regular text
   */
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),

  /**
   * Medium weight font family
   */
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),

  /**
   * Bold font family
   */
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),

  /**
   * Monospace font for code
   */
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'Courier New',
  }),
} as const;

// Font Sizes
export const fontSize = {
  /**
   * 11px - Extra extra small text
   */
  xxs: 11,

  /**
   * 12px - Extra small text
   */
  xs: 12,

  /**
   * 14px - Small text
   */
  sm: 14,

  /**
   * 16px - Base text size
   */
  md: 16,

  /**
   * 18px - Large text
   */
  lg: 18,

  /**
   * 20px - Extra large text
   */
  xl: 20,

  /**
   * 24px - Extra extra large text
   */
  xxl: 24,

  /**
   * 28px - Huge text
   */
  xxxl: 28,

  /**
   * 32px - Massive text
   */
  huge: 32,

  /**
   * 48px - Display text
   */
  display: 48,
} as const;

// Line Heights
export const lineHeight = {
  xxs: 16,
  xs: 18,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 36,
  xxxl: 40,
  huge: 48,
  display: 64,
} as const;

// Font Weights
export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
} as const;

// Typography Presets
export const typography = {
  /**
   * Display text - Used for large headings
   */
  display: {
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeight.bold,
  },

  /**
   * Heading 1 - Main page heading
   */
  h1: {
    fontSize: fontSize.huge,
    lineHeight: lineHeight.huge,
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeight.bold,
  },

  /**
   * Heading 2 - Section heading
   */
  h2: {
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeight.bold,
  },

  /**
   * Heading 3 - Subsection heading
   */
  h3: {
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontFamily: fontFamilies.bold,
    fontWeight: fontWeight.semiBold,
  },

  /**
   * Heading 4 - Minor heading
   */
  h4: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeight.semiBold,
  },

  /**
   * Heading 5 - Smallest heading
   */
  h5: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeight.semiBold,
  },

  /**
   * Body text - Default text style
   */
  body: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeight.normal,
  },

  /**
   * Body large - Emphasized body text
   */
  bodyLarge: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeight.normal,
  },

  /**
   * Body small - Secondary text
   */
  bodySmall: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeight.normal,
  },

  /**
   * Caption - Small supporting text
   */
  caption: {
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontFamily: fontFamilies.regular,
    fontWeight: fontWeight.normal,
  },

  /**
   * Label - Form labels and small headings
   */
  label: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeight.medium,
  },

  /**
   * Button text
   */
  button: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontFamily: fontFamilies.medium,
    fontWeight: fontWeight.semiBold,
  },

  /**
   * Monospace - For code or fixed-width text
   */
  mono: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.md,
    fontFamily: fontFamilies.mono,
    fontWeight: fontWeight.normal,
  },
} as const;

export type TypographyPreset = keyof typeof typography;
export type FontSize = keyof typeof fontSize;
export type LineHeight = keyof typeof lineHeight;
export type FontWeight = keyof typeof fontWeight;
