import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tourTypeEnum } from '@/utils/appConst';
export const useViewPreferencesStore = create<ViewPreferencesState>()(
  persist(
    (set, get) => ({
      imagesGridNumColumns: 'medium',
      photoStackNumColumns: 'large',

      tourCompletions: {
        [tourTypeEnum.EDITOR_TOUR]: false,
        [tourTypeEnum.IMAGES_TOUR]: false,
      },

      setImagesGridNumColumns: (value) => set({ imagesGridNumColumns: value }),
      setPhotoStackNumColumns: (value) => set({ photoStackNumColumns: value }),

      // Tour completion methods
      markTourCompleted: (tourType: tourTypeEnum) => {
        const currentCompletions = get().tourCompletions;
        set({
          tourCompletions: {
            ...currentCompletions,
            [tourType]: true,
          },
        });
      },

      isTourCompleted: (tourType: tourTypeEnum) => {
        return get().tourCompletions[tourType];
      },
    }),
    {
      name: 'view-preferences',
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 0) {
          const state = persistedState as ViewPreferencesState;
          if (state.photoStackNumColumns === ('medium' as string)) {
            state.photoStackNumColumns = 'large';
          }
          return state;
        }
        return persistedState as ViewPreferencesState;
      },
      partialize: (state) => ({
        imagesGridNumColumns: state.imagesGridNumColumns,
        photoStackNumColumns: state.photoStackNumColumns,
        tourCompletions: state.tourCompletions,
      }),
    }
  )
);

/* prettier-ignore */
export const IMAGES_GRID_NUM_COLUMNS = ['multiple','medium','single'] as const;
export const PHOTO_STACK_NUM_COLUMNS = [
  'small',
  'large',
  'multiple',
] as const;

export type ImagesGridNumColumns = (typeof IMAGES_GRID_NUM_COLUMNS)[number];
export type PhotoStackNumColumns = (typeof PHOTO_STACK_NUM_COLUMNS)[number];

interface ViewPreferencesState {
  imagesGridNumColumns: ImagesGridNumColumns;
  photoStackNumColumns: PhotoStackNumColumns;

  tourCompletions: {
    [tourTypeEnum.EDITOR_TOUR]: boolean;
    [tourTypeEnum.IMAGES_TOUR]: boolean;
  };

  setImagesGridNumColumns: (value: ImagesGridNumColumns) => void;
  setPhotoStackNumColumns: (value: PhotoStackNumColumns) => void;

  markTourCompleted: (tourType: tourTypeEnum) => void;
  isTourCompleted: (tourType: tourTypeEnum) => boolean;
}
