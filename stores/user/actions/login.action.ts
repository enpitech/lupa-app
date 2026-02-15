import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';
import { trackError } from '@/utils/datadogErrorTracking';
import { datadogRum } from '@datadog/browser-rum';

export const getLoginAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['login']
> = (set) => (user: User) => {
  set({ isLoading: true, error: null });
  try {
    // Set user context in Datadog for error tracking
    if (typeof datadogRum !== 'undefined' && datadogRum.setUser) {
      datadogRum.setUser({
        id: user.email, // Using email as unique identifier
        name: user.name,
        email: user.email,
      });
    }

    set({ user: { ...user, isAuthenticated: true }, isLoading: false });
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error('Login action failed');

    trackError(errorObj, {
      errorType: 'store_error',
      store: 'user',
      action: 'login',
      userEmail: user.email,
    });

    set({
      error: errorObj.message,
      isLoading: false,
    });
  }
};
