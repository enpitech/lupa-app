import useFilesProgressTracker from '@/stores/uploadProgress';

export interface ProcessingProgressState {
  processingTotal: number;
  processingDone: number;
  processingPercent: number;
  isProcessingActive: boolean;
}

export function useProcessingProgress(): ProcessingProgressState {
  const processingTotal = useFilesProgressTracker(
    (state) => state.processingTotal
  );
  const processingDone = useFilesProgressTracker(
    (state) => state.processingDone
  );
  const isProcessingActive = processingTotal > 0 && processingDone < processingTotal;
  const processingPercent = isProcessingActive
    ? Math.round((processingDone / processingTotal) * 100)
    : 0;

  return {
    processingTotal,
    processingDone,
    processingPercent,
    isProcessingActive,
  };
}
