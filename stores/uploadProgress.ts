import { create } from 'zustand';

interface FilesProgressTracker {
  processingTotal: number;
  processingDone: number;
  setProcessingTotal: (total: number) => void;
  incrementProcessingDone: () => void;
  resetProcessingProgress: () => void;
}

const useFilesProgressTracker = create<FilesProgressTracker>((set) => ({
  processingTotal: 0,
  processingDone: 0,
  setProcessingTotal: (total) => set({ processingTotal: total }),
  incrementProcessingDone: () =>
    set((state) => ({ processingDone: state.processingDone + 1 })),
  resetProcessingProgress: () => set({ processingTotal: 0, processingDone: 0 }),
}));

export default useFilesProgressTracker;
