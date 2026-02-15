import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AuthLoaderStore } from './types';

const initialState = {
  status: 'idle' as const,
  error: null,
};

export const useAuthLoaderStore = create<AuthLoaderStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setStatus: (status) => set({ status }),
    setError: (error) => set({ error }),
    setLoading: () => set({ status: 'loading', error: null }),
    setAuthenticated: () => set({ status: 'authenticated', error: null }),
    setUnauthenticated: () => set({ status: 'unauthenticated', error: null }),
    reset: () => set({ ...initialState }),

    waitForAuthentication: () => {
      return new Promise((resolve) => {
        const { status } = get();

        if (status === 'authenticated') {
          resolve(true);
          return;
        }

        if (status === 'unauthenticated' || status === 'error') {
          resolve(false);
          return;
        }

        // Subscribe to status changes
        const unsubscribe = useAuthLoaderStore.subscribe(
          (state) => state.status,
          (newStatus) => {
            if (newStatus === 'authenticated') {
              unsubscribe();
              resolve(true);
            } else if (
              newStatus === 'unauthenticated' ||
              newStatus === 'error'
            ) {
              unsubscribe();
              resolve(false);
            }
          }
        );
      });
    },
  }))
);

// Export the waitForAuthentication function for use in loaders
export const waitForAuthentication = () =>
  useAuthLoaderStore.getState().waitForAuthentication();
