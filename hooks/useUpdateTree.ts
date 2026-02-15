import { fetchUpdateTree } from '@/services/api/fetchUpdateTree';
import { TreeV5 } from '@/types/tree';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAlbumTreeStore from '@/stores/albumTree/index';
import { QUERY_KEY } from '@/utils/appConst';

export const useUpdateTree = () => {
  const queryClient = useQueryClient();

  interface updateTreeMutationFnProps {
    eventToken: string;
    tree: TreeV5 | null;
    deleteIds?: number[];
    force?: 'false' | 'true';
    invalidateAlbumCacheOnError?: boolean;
  }
  const updateTreeMutationFn = ({
    eventToken,
    tree,
    deleteIds,
    force,
  }: updateTreeMutationFnProps) => {
    return fetchUpdateTree(eventToken, tree, deleteIds, force);
  };

  return useMutation({
    mutationFn: updateTreeMutationFn,
    onMutate: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(true);
    },
    onSettled: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(false);
    },
    onError: (error, variables) => {
      console.error('Error updating tree:', error);
      // If this was a delete operation with optimistic cache update, invalidate to restore
      if (variables.invalidateAlbumCacheOnError && variables.eventToken) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.ALBUMS_BY_EVENT_TOKEN, variables.eventToken],
        });
      }
    },
  });
};
