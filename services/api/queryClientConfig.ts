import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user';
import { isCustomError, handleCustomError } from '@/utils/customErrorHandler';

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const is401Error = (error: unknown): boolean => {
  return (error as { message?: string; status?: number })?.message?.includes('status: 401') ||
         (error as { status?: number })?.status === 401;
};

const handle401Error = async (): Promise<boolean> => {
  const { user, refresh, logout } = useUserStore.getState();
  if (!user?.refreshtoken) {
    logout();
    return false;
  }

  try {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refresh(user).finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    if (!refreshPromise) {
      return false;
    }

    await Promise.race([
      refreshPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Token refresh timeout')), 10000)
      )
    ]);

    const updatedUser = useUserStore.getState().user;
    if (!updatedUser?.token) {
      logout();
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    logout();
    return false;
  }
};

const retryWithTokenRefresh = (failureCount: number, error: unknown) => {
  if (failureCount > 1) return false;
  if (!is401Error(error)) return false;

  return handle401Error();
};

const handleCustomErrorOnSuccess = (data: unknown) => {
  if (isCustomError(data)) {
    handleCustomError(data);
  }
};

const queryCache = new QueryCache({
  onSuccess: handleCustomErrorOnSuccess,
});

const mutationCache = new MutationCache({
  onSuccess: handleCustomErrorOnSuccess,
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      retry: retryWithTokenRefresh as (failureCount: number, error: Error) => boolean,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: retryWithTokenRefresh as (failureCount: number, error: Error) => boolean,
    },
  },
});
