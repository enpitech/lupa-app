import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AcceptScreenStore } from './types';

const initialState = {
  data: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const useAcceptScreenStore = create<AcceptScreenStore>()(
  persist(
    (set) => ({
      ...initialState,

      setData: (data) =>
        set({
          data,
          isLoading: false,
          error: null,
          isInitialized: true,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      clearData: () => set(initialState),

      setInitialized: (isInitialized) => set({ isInitialized }),
    }),
    {
      name: 'accept-screen-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        data: state.data,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
