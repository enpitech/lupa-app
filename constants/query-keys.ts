/**
 * Centralized TanStack Query keys.
 *
 * Use structured, hierarchical keys for cache management.
 * All query keys used across the app should be defined here.
 */
export const queryKeys = {
  user: {
    profile: (token?: string) => ['user-profile', token] as const,
    validate: ['user-validate'] as const,
  },
} as const;
