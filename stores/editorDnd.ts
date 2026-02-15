import { create } from 'zustand';
import {
  DraggableDataPage,
  DraggableDataImage,
} from '@/types/dnd';
import { DragTypeEditor } from '@/types/editor';

interface EditorDndState {
  activeImage: DraggableDataImage | undefined;
  activePage: DraggableDataPage | undefined;
  overPage: DraggableDataPage | undefined;
  overImage: DraggableDataImage | undefined;
  dragType: DragTypeEditor | null;
  setActiveImage: (image: DraggableDataImage | undefined) => void;
  setActivePage: (page: DraggableDataPage | undefined) => void;
  setOverPage: (page: DraggableDataPage | undefined) => void;
  setOverImage: (image: DraggableDataImage | undefined) => void;
  setDragType: (type: DragTypeEditor | null) => void;
  clearStates: () => void;
}

export const useEditorDndStore = create<EditorDndState>((set) => ({
  activeImage: undefined,
  activePage: undefined,
  overPage: undefined,
  overImage: undefined,
  dragType: null,

  setActiveImage: (image) => set({ activeImage: image }),
  setActivePage: (page) => set({ activePage: page }),
  setOverPage: (page) => set({ overPage: page }),
  setOverImage: (image) => set({ overImage: image }),
  setDragType: (type) => set({ dragType: type }),
  clearStates: () =>
    set({
      activeImage: undefined,
      activePage: undefined,
      overPage: undefined,
      overImage: undefined,
      dragType: null,
    }),
}));
