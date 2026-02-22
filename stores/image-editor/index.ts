import type { PinturaImageState } from '@pqina/pintura';
import { create } from 'zustand';

type ImageEditorState = {
  sourceUrl: string | null;
  folderID: number | null;
  eventToken: string | null;
  onResult: ((imageState: PinturaImageState) => void) | null;
  open: (params: {
    sourceUrl: string;
    folderID: number;
    eventToken: string;
    onResult: (imageState: PinturaImageState) => void;
  }) => void;
  reset: () => void;
};

export const useImageEditorStore = create<ImageEditorState>()((set) => ({
  sourceUrl: null,
  folderID: null,
  eventToken: null,
  onResult: null,
  open: ({ sourceUrl, folderID, eventToken, onResult }) =>
    set({ sourceUrl, folderID, eventToken, onResult }),
  reset: () =>
    set({ sourceUrl: null, folderID: null, eventToken: null, onResult: null }),
}));
