import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import { useUserStore } from '@/stores/user';
import { useAuthLoaderStore } from '@/stores/auth-loader';
import { fetchUser } from '@/services/api/fetch-user';

/**
 * Validates the persisted user session on app start.
 *
 * Flow:
 * 1. Zustand hydrates the user from secure storage (handled by persist middleware).
 * 2. If a token exists, we validate it against the API via `fetchUser`.
 * 3. The authLoader status is updated so the root layout can redirect accordingly.
 *
 * This is the React Native equivalent of `initialize-user.ts` from the web app,
 * without the URL-token deep-link path (not applicable on mobile).
 */
export async function initializeAuth(queryClient: QueryClient) {
  const user = useUserStore.getState().user;
  const setUser = useUserStore.getState().setUser;
  const { setAuthenticated, setUnauthenticated } =
    useAuthLoaderStore.getState();

  try {
    if (!user?.token) {
      setUnauthenticated();
      return;
    }

    await queryClient.fetchQuery({
      queryKey: queryKeys.user.validate,
      queryFn: () => fetchUser({ token: user.token }),
    });

    setAuthenticated();
  } catch (error) {
    console.error('Failed to validate session:', error);
    setUser(null);
    setUnauthenticated();
  }
}
