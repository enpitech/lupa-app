import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PageTitleState {
  titleInput: string;
  isBackgroundChange: boolean;
  hideBackgroundChangeDialog: boolean;
  setIsBackgroundChange: (isChange: boolean) => void;
  validationError: string | null;
  isValid: boolean;
  setTitleInput: (value: string) => void;
  setValidationError: (error: string | null) => void;
  setIsValid: (valid: boolean) => void;
  setHideBackgroundChangeDialog: (hide: boolean) => void;
  resetTitleInput: () => void;
}

export const usePageTitleStore = create<PageTitleState>()(
  persist(
    (set) => ({
      titleInput: '',
      isBackgroundChange: false,
      hideBackgroundChangeDialog: false,
      validationError: null,
      isValid: false,
      setIsBackgroundChange: (isChange: boolean) =>
        set({ isBackgroundChange: isChange }),
      setTitleInput: (value: string) => set({ titleInput: value }),
      setValidationError: (error: string | null) =>
        set({ validationError: error }),
      setIsValid: (valid: boolean) => set({ isValid: valid }),
      setHideBackgroundChangeDialog: (hide: boolean) =>
        set({ hideBackgroundChangeDialog: hide }),
      resetTitleInput: () =>
        set({ titleInput: '', validationError: null, isValid: false }),
    }),
    {
      name: 'page-title-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        hideBackgroundChangeDialog: state.hideBackgroundChangeDialog,
      }),
    }
  )
);
