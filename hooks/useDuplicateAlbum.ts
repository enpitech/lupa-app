import { duplicateAlbum } from '@/services/api/duplicateAlbum';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEY } from '@/utils/appConst';
import { Album } from '@/types/album';
import { useCallback } from 'react';

interface DuplicateAlbumParams {
  eventToken: string;
}

interface DuplicateAlbumResponse {
  isValid: boolean;
  Error?: string;
  error?: string;
  errorCode?: number;
  payload?: string;
}

interface UseDuplicateAlbumOptions {
  onSuccessCallback?: (newAlbum: Album) => void;
  onErrorCallback?: (errorMessagse: string, errorCode?: number) => void;
}

export const useDuplicateAlbum = (options?: UseDuplicateAlbumOptions) => {
  const queryClient = useQueryClient();
  const { onSuccessCallback, onErrorCallback } = options || {};

  const handleSuccess = useCallback(
    async (response: DuplicateAlbumResponse) => {
      if (response.payload) {
        // Invalidate query to refetch albums
        await queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.FETCH_USER_ALBUMS],
        });

        // Find the new album by token from the response
        const updatedAlbums = queryClient.getQueryData<Album[]>([
          QUERY_KEY.FETCH_USER_ALBUMS,
        ]);
        const newAlbumToken = response.payload;
        const newAlbum = updatedAlbums?.find(
          (album) => album.event_token === newAlbumToken
        );

        if (newAlbum && onSuccessCallback) {
          onSuccessCallback(newAlbum);
        }
      }
    },
    [queryClient, onSuccessCallback]
  );

  // Handle duplication errors
  const handleError = useCallback(
    (response: DuplicateAlbumResponse) => {
      const errorMessage = response.Error || response.error;
      const errorCode = response.errorCode;

      if (errorMessage === 'ERROR_EXCEED_COUNT_DUPLICATE' && onErrorCallback) {
        onErrorCallback('ERROR_EXCEED_COUNT_DUPLICATE', errorCode);
      } else {
        console.error('Failed to duplicate album:', response);
        onErrorCallback?.('UNKNOWN_ERROR', errorCode);
      }
    },
    [onErrorCallback]
  );

  return useMutation<DuplicateAlbumResponse, Error, DuplicateAlbumParams>({
    mutationFn: (params: DuplicateAlbumParams) => {
      return duplicateAlbum({
        eventToken: params.eventToken,
      });
    },
    onSuccess: async (response) => {
      if (response.isValid) {
        await handleSuccess(response);
      } else {
        handleError(response);
      }
      return response;
    },
    onError: (error) => {
      console.error('Network error during duplication:', error);
      onErrorCallback?.('NETWORK_ERROR');
    },
  });
};
