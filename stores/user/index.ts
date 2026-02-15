import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware';
import { getLoginAction } from './actions/login.action';
import { getLogoutAction } from './actions/logout.action';
import { getUpdateProfileAction } from './actions/updateProfile.action';
import { UserState, UserStore } from '@/types/user';
import { refreshTokenAction } from './actions/refresh.action';
import { useAuthLoaderStore } from '@/stores/authLoader';

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStore>()(
  subscribeWithSelector(
    persist(
      (set, get, store) => ({
        ...initialState,
        login: getLoginAction(set, get, store),
        logout: getLogoutAction(set, get, store),
        updateProfile: getUpdateProfileAction(set, get, store),
        refresh: refreshTokenAction(set, get, store),
        setUser: (user) => set({ user }),
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({ user: state.user }),
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

// Side effect subscriptions
useUserStore.subscribe(
  (state) => state.user,
  (user) => {
    if (user?.isAuthenticated) {
      // Update auth store to authenticated state
      useAuthLoaderStore.getState().setAuthenticated();
    } else {
      // Update auth store to unauthenticated state
      useAuthLoaderStore.getState().setUnauthenticated();
    }
  }
);

useUserStore.subscribe(
  (state) => state.error,
  (error) => {
    if (error) {
      console.error('An error occurred:', error);
      // Handle error, e.g., show a notification
    }
  }
);
