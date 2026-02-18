import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';
import { fetchRefreshToken } from '@/services/api/fetch-refresh-token';
import { secureStorage } from '@/utils/secure-storage';

export const refreshTokenAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['refresh']
> = (set) => async (currentUser: User | null) => {
  set({ isLoading: true, error: null });

  try {
    if (!currentUser) {
      set({ user: null });
      return;
    }

    const data = await fetchRefreshToken();

    if (data.isValid) {
      set({
        user: {
          ...currentUser,
          token: data.payload,
          refreshtoken: data.payload,
          isAuthenticated: true,
        },
      });

      await secureStorage.setItem(
        'lastTokenRefresh',
        Date.now().toString()
      );
    } else {
      set({ user: null });
    }
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error('Error refreshing token');

    console.error('Error refreshing token:', errorObj);

    set({ user: null });
  } finally {
    set({ isLoading: false });
  }
};
