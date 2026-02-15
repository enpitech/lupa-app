import { editTheme } from '@/services/api/editTheme';
import { PhotoAlbum } from '@/types/tree';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAlbumTreeStore from '@/stores/albumTree/index';
import { useAlbumTreeCovers } from '@/stores/cover';
import useLayoutTreeStore from '@/stores/layout';
import { useSaveLock } from './useSaveLock';
import { openGenericErrorDialog } from '@/utils/editor/openGenericErrorDialog';
import useAlbumTreeTemporalStore from '@/stores/albumTree/useTemporalStore';

export type EditThemeResponse = {
  payload: {
    m_treeMessage: PhotoAlbum;
    smartbookInfo: unknown;
  };
  isValid: boolean;
};

export const useEditTheme = () => {
  const queryClient = useQueryClient();
  const { waitForSaveLock } = useSaveLock();
  const clear = useAlbumTreeTemporalStore((state) => state.clear);

  interface EditThemeParams {
    eventToken: string;
    album_theme: string;
    tree: PhotoAlbum | null;
  }

  const mutationFn = async ({
    eventToken,
    album_theme,
    tree,
  }: EditThemeParams) => {
    // Wait for auto-save lock to be released
    await waitForSaveLock();
    const m_creationTime = useAlbumTreeStore.getState().m_creationTime;

    return editTheme({ eventToken, album_theme, tree, m_creationTime });
  };

  return useMutation({
    mutationFn,
    onSuccess: (data: EditThemeResponse) => {
      useAlbumTreeCovers.getState().refetchCovers(queryClient);
      if (!data?.payload) {
        console.error('Theme edit response missing payload:', data);
        return;
      }

      // Update album with new tree and creation time
      useAlbumTreeStore
        .getState()
        .updateAlbumAndClearHistory(data.payload.m_treeMessage);

      const resources = data.payload.m_treeMessage?.m_treeV5Resources;
      if (resources?.m_album_resources?.m_frames_resources) {
        useLayoutTreeStore
          .getState()
          .setFramesResources(resources.m_album_resources.m_frames_resources);
        useLayoutTreeStore.getState().setAlbumResources(resources);
      }
    },
    onMutate: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(true);
      useAlbumTreeStore.getState().setIsThemeEditPending(true);
    },
    onSettled: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(false);
      useAlbumTreeStore.getState().setIsThemeEditPending(false);
      clear();
    },
    onError: (error) => {
      console.error('Error editing theme:', error);
      // Show error dialog to user
      openGenericErrorDialog();
    },
  });
};
