import { queryKeys } from '@/constants/query-keys';
import { fetchCreateAlbum, type CreateAlbumParams } from '@/services/api/fetch-create-album';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateAlbum = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateAlbumParams) => fetchCreateAlbum(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.albums.list });
    },
  });
};
