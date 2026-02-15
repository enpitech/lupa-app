import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { fetchCheckDate, type CheckDateResponse } from '@/services/api/fetchCheckDate';
import useAlbumTreeStore from '@/stores/albumTree/index';
import { ERROR_MESSAGES } from '@/utils/appConst';
import { PhotoAlbum } from '@/types/tree';

interface UseTreeUpdateCheckerProps {
  eventToken?: string;
  enabled?: boolean;
  intervalMs?: number;
}

const TREE_UPDATE_QUERY_KEY = 'tree-update-checker';

export const useTreeUpdateChecker = ({
  eventToken,
  enabled = true,
  intervalMs = 30000,
}: UseTreeUpdateCheckerProps) => {
  // #TODO : fix re-rendering issue
  const m_creationTime = useAlbumTreeStore((state) => state.m_creationTime);
  const isInSaveProcess = useAlbumTreeStore((state) => state.isInSaveProcess);
  const isInAutoSaveProcess = useAlbumTreeStore((state) => state.isInAutoSaveProcess);
  const isTreeUpdating = isInSaveProcess || isInAutoSaveProcess;


  const processTreeUpdate = useCallback((response: CheckDateResponse) => {
    if (
      !response.isValid &&
      response.errorCode === ERROR_MESSAGES.DATA_CONFLICT_ERROR_CODE &&
      response.payload?.m_treeV5
    ) {
      const updatedAlbum = {
        m_version: (response.payload.m_treeV5.M_VERSION as number) || 1,
        m_isValid: true,
        m_treeV5: response.payload.m_treeV5,
      } as PhotoAlbum;

      const updateAlbumAndClearHistory =
        useAlbumTreeStore.getState().updateAlbumAndClearHistory;
      updateAlbumAndClearHistory(updatedAlbum);
    }
  }, []);

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    queryKey: [TREE_UPDATE_QUERY_KEY, eventToken],
    queryFn: () => fetchCheckDate(eventToken!, m_creationTime!),
    enabled: Boolean(
      enabled && eventToken && m_creationTime && !isTreeUpdating
    ),
    refetchInterval: isTreeUpdating ? false : intervalMs,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry up to 3 times with exponential backoff
      if (failureCount >= 3) return false;

      // Don't retry on certain error types
      if (error instanceof Error && error.message.includes('403')) {
        return false;
      }

      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: intervalMs / 2,
    gcTime: intervalMs, // Cache for the interval duration
  });

  useEffect(() => {
    if (data) {
      try {
        processTreeUpdate(data);
      } catch (error) {
        console.error('Error processing tree update:', error);
      }
    }
  }, [data, processTreeUpdate]);

  useEffect(() => {
    if (error) {
      console.error('Tree update checker error:', error);
    }
  }, [error]);

  const checkForUpdates = useCallback(() => {
    return refetch();
  }, [refetch]);

  return {
    checkForUpdates,
    isChecking: isFetching,
    isLoading,
    error,
    data,
  };
};
