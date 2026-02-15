import { create } from 'zustand';
import { CustomErrorDetails } from '@/types/customError';

interface CustomErrorStore {
  error: CustomErrorDetails | null;
  setError: (error: CustomErrorDetails) => void;
  clearError: () => void;
}

export const useCustomErrorStore = create<CustomErrorStore>((set) => ({
  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
