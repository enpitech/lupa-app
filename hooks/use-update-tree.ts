import { queryKeys } from '@/constants/query-keys';
import { fetchUpdateTree } from '@/services/api/fetch-update-tree';
import type { PhotoAlbum } from '@/types/tree';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateTree = ({ eventToken }: { eventToken: string }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ album }: { album: PhotoAlbum }) =>
      fetchUpdateTree({ eventToken, tree: album.m_treeV5 }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.albums.tree(eventToken),
      });
    },
  });
};
