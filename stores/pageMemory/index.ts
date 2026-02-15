import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PAGE_MEMORY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

interface PageMemoryState {
  isReturningToSameAlbum: boolean;
  sessionStartTime: string | null;

  setIsReturningToSameAlbum: (sameAlbum: boolean) => void;
  startSession: () => void;
  isActiveSession: () => boolean;
  clearSession: () => void;
}

export const usePageMemoryStore = create<PageMemoryState>()(
  persist(
    (set, get) => ({
      isReturningToSameAlbum: false,
      sessionStartTime: null,

      setIsReturningToSameAlbum: (sameAlbum: boolean) => {
        set({ isReturningToSameAlbum: sameAlbum });
      },

      startSession: () => {
        const startTime = new Date().toISOString();
        set({ sessionStartTime: startTime });
      },

      isActiveSession: () => {
        const state = get();

        if (!state.sessionStartTime) {
          return false;
        }

        // Check if timeout has passed
        const sessionStart = new Date(state.sessionStartTime).getTime();
        const now = Date.now();
        const elapsed = now - sessionStart;

        const isActive = elapsed < PAGE_MEMORY_TIMEOUT_MS;

        return isActive;
      },

      clearSession: () => {
        set({ sessionStartTime: null });
      },
    }),
    {
      name: 'page-memory-storage',
      partialize: (state) => ({
        isReturningToSameAlbum: state.isReturningToSameAlbum,
        sessionStartTime: state.sessionStartTime,
      }),
    }
  )
);
