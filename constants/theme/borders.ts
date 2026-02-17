/**
 * Border Radius Values
 * 
 * Consistent border radius values for rounded corners.
 */

export const borderRadius = {
  /**
   * 0px - No rounding
   */
  none: 0,

  /**
   * 2px - Subtle rounding
   */
  xs: 2,

  /**
   * 4px - Small rounding
   */
  sm: 4,

  /**
   * 8px - Default rounding
   */
  md: 8,

  /**
   * 12px - Large rounding
   */
  lg: 12,

  /**
   * 16px - Extra large rounding
   */
  xl: 16,

  /**
   * 24px - Huge rounding
   */
  xxl: 24,

  /**
   * 999px - Full rounding (pill shape)
   */
  full: 999,
} as const;

export type BorderRadiusSize = keyof typeof borderRadius;

/**
 * Border widths
 */
export const borderWidth = {
  none: 0,
  thin: 1,
  medium: 2,
  thick: 3,
} as const;

export type BorderWidthSize = keyof typeof borderWidth;
