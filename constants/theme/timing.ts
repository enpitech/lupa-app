/**
 * Animation Timing
 * 
 * Standard animation durations for consistent motion.
 */

export const timing = {
  /**
   * 100ms - Instant feedback
   */
  instant: 100,

  /**
   * 200ms - Quick animations
   */
  quick: 200,

  /**
   * 300ms - Default animation time
   */
  normal: 300,

  /**
   * 500ms - Slower animations
   */
  slow: 500,

  /**
   * 800ms - Very slow animations
   */
  slower: 800,
} as const;

export type TimingDuration = keyof typeof timing;
