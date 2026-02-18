import { StateCreator } from 'zustand';
import { UserStore } from '@/types/user';

export const getLogoutAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['logout']
> = (set) => () => {
  set({ user: null, isLoading: false });
};
