import { fetchUpdateTree } from '@/services/api/fetch-update-tree';
import type { PhotoAlbum } from '@/types/tree';
import { useMutation } from '@tanstack/react-query';

export const useUpdateTree = ({ eventToken }: { eventToken: string }) => {
  return useMutation({
    mutationFn: ({ album }: { album: PhotoAlbum }) =>
      fetchUpdateTree({ eventToken, tree: album.m_treeV5 }),
  });
};
