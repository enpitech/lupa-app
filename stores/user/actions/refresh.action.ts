import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';
import { fetchRefreshToken } from '@/services/api/fetchRefreshToken';
import { trackError } from '@/utils/datadogErrorTracking';

export const refreshTokenAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['refresh']
> = (set) => async (currentUser: User | null) => {
  set({ isLoading: true, error: null });

  try {
    if (!currentUser) {
      set({
        user: null,
      });
      return;
    }

    // Fetch a new token using the refresh token
    const data = await fetchRefreshToken();
    if (data.isValid) {
      // Update only the tokens
      set({
        user: {
          ...currentUser,
          token: data.payload,
          refreshtoken: data.payload,
          isAuthenticated: true,
        },
      });

      localStorage.setItem('lastTokenRefresh', Date.now().toString());
    } else {
      set({
        user: null,
      });
    }
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error('Error refreshing token');

    trackError(errorObj, {
      errorType: 'store_error',
      store: 'user',
      action: 'refreshToken',
      userEmail: currentUser?.email,
    });

    set({
      user: null,
    });
  } finally {
    set({
      isLoading: false,
    });
  }
};
