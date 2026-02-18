import { StateCreator } from 'zustand';
import { UserStore, User } from '@/types/user';

export const getUpdateProfileAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['updateProfile']
> = (set, get) => async (updates: Partial<User>) => {
  set({ isLoading: true, error: null });
  try {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    // TODO: Replace with actual API call when endpoint is available
    const updatedUser = { ...currentUser, ...updates };

    set({
      user: { ...updatedUser, isAuthenticated: true },
      isLoading: false,
    });
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error('Update profile failed');

    console.error('Update profile failed:', errorObj);

    set({ error: errorObj.message, isLoading: false });
  }
};
