import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';

export const getLoginAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['login']
> = (set) => (user: User) => {
  set({ isLoading: true, error: null });
  try {
    set({ user: { ...user, isAuthenticated: true }, isLoading: false });
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error('Login action failed');

    console.error('Login action failed:', errorObj);

    set({
      error: errorObj.message,
      isLoading: false,
    });
  }
};
