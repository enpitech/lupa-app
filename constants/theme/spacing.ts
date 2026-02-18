/**
 * Spacing Scale
 * 
 * Consistent spacing values for margins, padding, and gaps.
 * Use these instead of arbitrary numbers for design consistency.
 */

export const spacing = {
  /**
   * 2px - Extra extra small spacing
   */
  xxxs: 2,

  /**
   * 4px - Extra extra small spacing
   */
  xxs: 4,

  /**
   * 8px - Extra small spacing
   */
  xs: 8,

  /**
   * 12px - Small spacing
   */
  sm: 12,

  /**
   * 16px - Medium spacing (default)
   */
  md: 16,

  /**
   * 20px - Medium-large spacing
   */
  lg: 20,

  /**
   * 24px - Large spacing
   */
  xl: 24,

  /**
   * 32px - Extra large spacing
   */
  xxl: 32,

  /**
   * 40px - Extra extra large spacing
   */
  xxxl: 40,

  /**
   * 48px - Huge spacing
   */
  huge: 48,

  /**
   * 64px - Massive spacing
   */
  massive: 64,
} as const;

export type SpacingSize = keyof typeof spacing;

/**
 * Use this for horizontal padding/margin across the app
 */
export const screenPadding = {
  horizontal: spacing.md,
  vertical: spacing.lg,
} as const;
