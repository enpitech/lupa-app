import { closeAlbum, CloseAlbumParams } from '@/services/api/closeAlbum';
import { useMutation } from '@tanstack/react-query';
import { trackUserActionError } from '@/utils/datadogErrorTracking';

export const useCloseAlbum = () => {
  const mutationFn = (params: CloseAlbumParams) =>
    closeAlbum({
      eventToken: params.eventToken,
      lang: params.lang,
      format: params.format,
      density: params.density,
      direction: params.direction,
      album_theme: params.album_theme,
      is_cover_edited: params.is_cover_edited,
      flipbook_new: params.flipbook_new,
    });

  return useMutation({
    mutationFn: mutationFn,
    onSuccess: (data) => {
      return data;
    },
    onError: (error, variables) => {
      trackUserActionError(error as Error, 'closeAlbum', {
        component: 'useCloseAlbum',
        eventToken: variables.eventToken,
        format: variables.format,
      });
    },
  });
};
