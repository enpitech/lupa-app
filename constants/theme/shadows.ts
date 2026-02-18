/**
 * Shadow Presets
 * 
 * Platform-specific shadow/elevation presets for depth and layering.
 */

import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  | 'shadowColor'
  | 'shadowOffset'
  | 'shadowOpacity'
  | 'shadowRadius'
  | 'elevation'
>;

/**
 * Creates a platform-specific shadow style
 */
const createShadow = (
  elevation: number,
  shadowRadius: number,
  shadowOpacity: number
): ShadowStyle => {
  if (Platform.OS === 'android') {
    return { elevation };
  }

  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity,
    shadowRadius,
    elevation, // Include for Android fallback
  };
};

export const shadows = {
  /**
   * No shadow
   */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  /**
   * Small shadow - Subtle elevation
   */
  sm: createShadow(2, 2, 0.1),

  /**
   * Medium shadow - Default card elevation
   */
  md: createShadow(4, 4, 0.12),

  /**
   * Large shadow - Prominent elevation
   */
  lg: createShadow(8, 8, 0.15),

  /**
   * Extra large shadow - Modal/dialog elevation
   */
  xl: createShadow(12, 12, 0.18),

  /**
   * Huge shadow - Maximum elevation
   */
  xxl: createShadow(16, 16, 0.2),
} as const;

export type ShadowSize = keyof typeof shadows;
