import { create } from 'zustand';
import { useViewPreferencesStore } from '../viewPreferences';
import { tourTypeEnum } from '@/utils/appConst';
import { tourSetTimeoutDuration } from '@/utils/tourConstants';
export interface TourState {
  // Editor Tour
  editorRun: boolean;
  editorStepIndex: number;

  // Images Tour
  imagesRun: boolean;
  imagesStepIndex: number;


  startEditorTour: () => void;
  stopEditorTour: () => void;
  nextEditorStep: () => void;
  prevEditorStep: () => void;

  startImagesTour: () => void;
  stopImagesTour: () => void;
  nextImagesStep: () => void;
  prevImagesStep: () => void;

  startFullTour: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  editorRun: false,
  editorStepIndex: 0,

  imagesRun: false,
  imagesStepIndex: 0,

  startEditorTour: () => {
    // Check if tour has already been completed
    const viewPrefsStore = useViewPreferencesStore.getState();
    if (viewPrefsStore.isTourCompleted(tourTypeEnum.EDITOR_TOUR)) {
      return;
    }

    set({
      editorRun: true,
      editorStepIndex: 0,
    });
  },

  stopEditorTour: () => {
    // Mark tour as completed when stopped (by user action like skip/close)
    const viewPrefsStore = useViewPreferencesStore.getState();
    viewPrefsStore.markTourCompleted(tourTypeEnum.EDITOR_TOUR);

    set({
      editorRun: false,
      editorStepIndex: 0,
    });
  },

  nextEditorStep: () => {
    const { editorStepIndex } = get();
    set({
      editorStepIndex: editorStepIndex + 1,
    });
  },

  prevEditorStep: () => {
    const { editorStepIndex } = get();
    if (editorStepIndex > 0) {
      set({
        editorStepIndex: editorStepIndex - 1,
      });
    }
  },

  startImagesTour: () => {
    // Check if tour has already been completed
    const viewPrefsStore = useViewPreferencesStore.getState();
    if (viewPrefsStore.isTourCompleted(tourTypeEnum.IMAGES_TOUR)) {
      return;
    }

    setTimeout(() => {
      // Check if images grid section is already visible
      const imagesGridSection = document.querySelector(
        '[data-testid="expanded-sidebar-menu-images-grid-section"]'
      );

      // If images section is already visible, start on step 1 (main tour)
      // Otherwise start on step 0 (navigation step)
      const initialStepIndex = imagesGridSection ? 1 : 0;
      set({
        imagesRun: true,
        imagesStepIndex: initialStepIndex,
      });
    }, tourSetTimeoutDuration);
  },

  stopImagesTour: () => {
    // Mark tour as completed when stopped (by user action like skip/close)
    const viewPrefsStore = useViewPreferencesStore.getState();
    viewPrefsStore.markTourCompleted(tourTypeEnum.IMAGES_TOUR);

    set({
      imagesRun: false,
      imagesStepIndex: 0,
    });
  },

  nextImagesStep: () => {
    const { imagesStepIndex } = get();
    set({
      imagesStepIndex: imagesStepIndex + 1,
    });
  },

  prevImagesStep: () => {
    const { imagesStepIndex } = get();
    if (imagesStepIndex > 0) {
      set({
        imagesStepIndex: imagesStepIndex - 1,
      });
    }
  },

  startFullTour: () => {
    set({
      editorRun: true,
      editorStepIndex: 1, // Skip welcome step (step 0)
    });
  },
}));
