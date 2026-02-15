import { createAlbum } from '@/services/api/createAlbum';
import { useMutation } from '@tanstack/react-query';
import { Album } from '@/stores/album/types';
import { useUserStore } from '@/stores/user';
import { useTranslationData } from '@/hooks/useTranslationData';
import { trackUserActionError } from '@/utils/datadogErrorTracking';

interface AlbumResponse {
  payload: Album;
}

interface CreateAlbumParams {
  albumName: string;
  eventType: string;
  flipbookNew: boolean;
  appVersion: string;
  deviceType: string;
  albumToken?: string;
  isOnEditor?: boolean;
}

export const useCreateAlbum = () => {
  const { language } = useTranslationData();

  return useMutation<AlbumResponse, Error, CreateAlbumParams>({
    mutationFn: (params: CreateAlbumParams) => {
      const token = useUserStore.getState().user?.token || '';

      return createAlbum({
        token,
        ...params,
        language,
      });
    },
    onError: (error, variables) => {
      trackUserActionError(error as Error, 'createAlbum', {
        component: 'useCreateAlbum',
        albumName: variables.albumName,
        eventType: variables.eventType,
        isUpdate: !!variables.albumToken,
      });
    },
  });
};
