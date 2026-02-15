import { StateCreator } from 'zustand';
import { UserStore } from '@/types/user';
import { datadogRum } from '@datadog/browser-rum';

export const getLogoutAction: StateCreator<
  UserStore,
  [],
  [],
  UserStore['logout']
> = (set) => () => {
  // Clear user context from Datadog
  if (typeof datadogRum !== 'undefined' && datadogRum.clearUser) {
    datadogRum.clearUser();
  }

  set({ user: null, isLoading: false });
};
