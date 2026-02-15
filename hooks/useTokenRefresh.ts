import { useUserStore } from '@/stores/user';
import { useEffect, useRef } from 'react';

const refreshInterval = 5.5 * 60 * 60 * 1000;

export const useTokenRefresh = () => {
  const user = useUserStore((state) => state.user);
  const refresh = useUserStore((state) => state.refresh);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Server doesn't send 'refreshtoken', temporary use 'token'
    if (user?.token) {
      const scheduleRefresh = () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }

        refreshTimeoutRef.current = setTimeout(async () => {
          try {
            // Same here, should be refreshtoken
            if (user?.token) {
              await refresh(user);
              scheduleRefresh();
            }
          } catch (error) {
            console.error('Failed to refresh token:', error);
            setTimeout(scheduleRefresh, 3 * 60 * 1000);
          }
        }, refreshInterval);
      };

      scheduleRefresh();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const lastRefreshTime = localStorage.getItem('lastTokenRefresh');
          if (lastRefreshTime) {
            const timeSinceRefresh = Date.now() - parseInt(lastRefreshTime, 10);
            if (timeSinceRefresh > refreshInterval) {
              refresh(user).then(() => {
                scheduleRefresh();
              });
            }
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
      };
    }
  }, [user, refresh]);

  useEffect(() => {
    if (user?.token) {
      localStorage.setItem('lastTokenRefresh', Date.now().toString());
    }
  }, [user?.token]);
};
