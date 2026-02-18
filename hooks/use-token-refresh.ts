import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useUserStore } from '@/stores/user';
import { secureStorage } from '@/utils/secure-storage';

const REFRESH_INTERVAL = 5.5 * 60 * 60 * 1000; // 5.5 hours
const RETRY_INTERVAL = 3 * 60 * 1000; // 3 minutes

/**
 * Schedules periodic token refreshes and refreshes on app foregrounding
 * when the token is stale. Uses AppState instead of document.visibilityState
 * for React Native compatibility.
 */
export const useTokenRefresh = () => {
  const user = useUserStore((state) => state.user);
  const refresh = useUserStore((state) => state.refresh);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Periodic refresh on a timer
  useEffect(() => {
    if (!user?.token) return;

    const scheduleRefresh = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        try {
          if (user?.token) {
            await refresh(user);
            scheduleRefresh();
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          setTimeout(scheduleRefresh, RETRY_INTERVAL);
        }
      }, REFRESH_INTERVAL);
    };

    scheduleRefresh();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [user, refresh]);

  // Refresh when app returns to foreground after a long background period
  useEffect(() => {
    if (!user?.token) return;

    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;

      const lastRefreshTime = await secureStorage.getItem('lastTokenRefresh');
      if (!lastRefreshTime) return;

      const timeSinceRefresh = Date.now() - parseInt(lastRefreshTime, 10);
      if (timeSinceRefresh > REFRESH_INTERVAL) {
        await refresh(user);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => subscription.remove();
  }, [user, refresh]);

  // Record the time of the last token change
  useEffect(() => {
    if (user?.token) {
      secureStorage.setItem('lastTokenRefresh', Date.now().toString());
    }
  }, [user?.token]);
};
