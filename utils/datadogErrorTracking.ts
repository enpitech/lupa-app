import { datadogRum } from '@datadog/browser-rum';
import useAlbumTreeStore from '@/stores/albumTree';

/**
 * Enhanced error tracking utilities for Datadog RUM
 * Following official Datadog best practices: https://docs.datadoghq.com/error_tracking/frontend/collecting_browser_errors/
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  albumId?: string;
  eventToken?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  [key: string]: unknown;
}

/**
 * Get album context from store
 */
const getAlbumContext = (): {
  albumToken?: string;
  albumName?: string;
  albumTheme?: string;
  coverTheme?: string;
  pageCount?: number;
  imageCount?: number;
} => {
  try {
    const album = useAlbumTreeStore.getState().album;

    if (album?.m_treeV5) {
      return {
        albumToken: album.m_treeV5.m_album_token,
        albumName: album.m_treeV5.m_album_name,
        albumTheme: album.m_treeV5.m_album_theme,
        coverTheme: album.m_treeV5.m_cover_theme,
        pageCount: album.m_treeV5.m_book_subtree?.m_spread_folders?.length,
        imageCount: album.m_treeV5.m_book_subtree?.m_tree_tmages?.length,
      };
    }
  } catch {
    // Silently fail if store is not available (e.g., during app initialization)
  }
  return {};
};

/**
 * Send error to Datadog with enriched context using official addError API
 * Best Practice: Use datadogRum.addError() with context parameter
 * Automatically includes album context from store when available
 */
export const trackError = (
  error: Error | string,
  context?: ErrorContext
): void => {
  try {
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Automatically enrich with album context from store
    const albumContext = getAlbumContext();

    if (typeof datadogRum !== 'undefined' && datadogRum.addError) {
      // Official Datadog API - context is enriched automatically with RUM data
      datadogRum.addError(errorObj, {
        ...albumContext,
        ...context,
        timestamp: new Date().toISOString(),
      });
    }

    // Also log to console for development (Datadog auto-captures console.error too)
    console.error('Error tracked:', errorObj, { ...albumContext, ...context });
  } catch (e) {
    console.error('Failed to track error:', e);
  }
};

/**
 * Track API errors with proper context
 * Best Practice: Include endpoint, method, statusCode for better filtering
 */
export const trackApiError = (
  error: Error | string,
  endpoint: string,
  context?: {
    method?: string;
    statusCode?: number;
    requestBody?: unknown;
    [key: string]: unknown;
  }
): void => {
  trackError(error, {
    errorType: 'api_error',
    endpoint,
    method: context?.method || 'GET',
    statusCode: context?.statusCode,
    ...context,
  });
};

/**
 * Track user action errors with action context
 * Best Practice: Include component and action name for better debugging
 */
export const trackUserActionError = (
  error: Error | string,
  action: string,
  context?: {
    component?: string;
    [key: string]: unknown;
  }
): void => {
  trackError(error, {
    errorType: 'user_action_error',
    action,
    component: context?.component,
    ...context,
  });
};

/**
 * Add custom action to Datadog RUM
 */
export const trackAction = (
  name: string,
  context?: Record<string, unknown>
): void => {
  try {
    if (typeof datadogRum !== 'undefined' && datadogRum.addAction) {
      datadogRum.addAction(name, context);
    }
  } catch (e) {
    console.error('Failed to track action:', e);
  }
};

/**
 * Add custom timing to Datadog RUM
 */
export const addTiming = (name: string): void => {
  try {
    if (typeof datadogRum !== 'undefined' && datadogRum.addTiming) {
      datadogRum.addTiming(name);
    }
  } catch (e) {
    console.error('Failed to add timing:', e);
  }
};

/**
 * Set user context in Datadog RUM
 */
export const setUserContext = (user: {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}): void => {
  try {
    if (typeof datadogRum !== 'undefined' && datadogRum.setUser) {
      datadogRum.setUser(user);
    }
  } catch (e) {
    console.error('Failed to set user context:', e);
  }
};

/**
 * Clear user context in Datadog RUM (on logout)
 */
export const clearUserContext = (): void => {
  try {
    if (typeof datadogRum !== 'undefined' && datadogRum.clearUser) {
      datadogRum.clearUser();
    }
  } catch (e) {
    console.error('Failed to clear user context:', e);
  }
};

/**
 * Add feature flag context
 */
export const addFeatureFlagContext = (flags: Record<string, boolean>): void => {
  try {
    if (
      typeof datadogRum !== 'undefined' &&
      datadogRum.addFeatureFlagEvaluation
    ) {
      Object.entries(flags).forEach(([key, value]) => {
        datadogRum.addFeatureFlagEvaluation(key, value);
      });
    }
  } catch (e) {
    console.error('Failed to add feature flag context:', e);
  }
};

/**
 * Track performance timing
 */
export const trackPerformance = (
  name: string,
  startTime: number,
  metadata?: Record<string, unknown>
): void => {
  try {
    const duration = performance.now() - startTime;

    if (typeof datadogRum !== 'undefined' && datadogRum.addAction) {
      datadogRum.addAction(name, {
        ...metadata,
        duration,
        type: 'performance',
      });
    }

    console.log(`Performance [${name}]:`, duration, 'ms', metadata);
  } catch (e) {
    console.error('Failed to track performance:', e);
  }
};
