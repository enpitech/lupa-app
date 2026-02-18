/**
 * Theme Configuration
 * 
 * Central export for all theme tokens.
 * Import this file to access colors, spacing, typography, etc.
 * 
 * @example
 * import { theme } from '@/constants/theme';
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     padding: theme.spacing.md,
 *     backgroundColor: theme.colors.background,
 *   },
 *   title: {
 *     ...theme.typography.h1,
 *     color: theme.colors.text,
 *   },
 * });
 */

import { borderRadius, borderWidth } from './borders';
import { colors } from './colors';
import { shadows } from './shadows';
import { screenPadding, spacing } from './spacing';
import { timing } from './timing';
import { fontFamilies, fontSize, fontWeight, lineHeight, typography } from './typography';

export {
    borderRadius,
    borderWidth,
    type BorderRadiusSize,
    type BorderWidthSize
} from './borders';
export { colors, palette, type ColorName, type PaletteName } from './colors';
export { shadows, type ShadowSize } from './shadows';
export { screenPadding, spacing, type SpacingSize } from './spacing';
export { timing, type TimingDuration } from './timing';
export {
    fontFamilies, fontSize, fontWeight, lineHeight, typography, type FontSize, type FontWeight, type LineHeight, type TypographyPreset
} from './typography';

// Convenience export for the entire theme
export const theme = {
  colors,
  spacing,
  typography,
  timing,
  shadows,
  borderRadius,
  borderWidth,
  fontSize,
  lineHeight,
  fontWeight,
  fontFamilies,
  screenPadding,
} as const;

export type Theme = typeof theme;
