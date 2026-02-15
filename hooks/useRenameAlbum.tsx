import { useDirection } from '@/contexts/direction-context';
import { useTranslation } from '@/hooks/useTranslation';
import useAlbumStore from '@/stores/album';
import useAlbumTreeStore from '@/stores/albumTree';
import { useAlbumTreeCovers } from '@/stores/cover';
import { Album } from '@/types/album';
import { PATHS, QUERY_KEY } from '@/utils/appConst';
import { useQueryClient } from '@tanstack/react-query';
// TODO: Replace with RN components
// import { AlbumNameContent } from '@/components/AlbumNameContent';
// import CenteredModalHeader from '@/components/CenteredModalHeader';

export function useRenameAlbum() {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const location = useLocation();
  // const openModal = useModalStore((state) => state.openModal);
  // const closeModal = useModalStore((state) => state.closeModal);
  const queryClient = useQueryClient();
  const setAlbum = useAlbumStore((state) => state.setAlbum);

  const isOnEditor = location.pathname.includes(PATHS.PREVIEW);
  const updateAlbumNameOptimistically = (albumId: number, newName: string) => {
    queryClient.setQueryData<Album[] | undefined>(
      [QUERY_KEY.FETCH_USER_ALBUMS],
      (oldData) => {
        if (!oldData) return oldData;
        return oldData.map((item) =>
          item.album_id === albumId ? { ...item, name: newName } : item
        );
      }
    );
    if (isOnEditor) {
      const currentAlbum = useAlbumStore.getState().album;

      if (currentAlbum && currentAlbum.album_id === albumId) {
        setAlbum({ ...currentAlbum, name: newName });

        // Update album tree store using the new action
        useAlbumTreeStore.getState().renameAlbum(newName);
        useAlbumTreeCovers.getState().refetchCovers(queryClient);
      }
    }
  };

  const handleRenameAlbum = (album: Album) => {
    // TODO: Implement the modal using React Native components
    // openModal({
    //   modalWidth: 'w-1/3',
    //   header: <CenteredModalHeader title={t('actions.rename')} />,
    //   content: (
    //     <div dir={direction}>
    //       <AlbumNameContent
    //         key={`rename-${album.album_id}-${Date.now()}`}
    //         initialName={album.name}
    //         albumToken={album.event_token}
    //         onSave={(newName: string) => {
    //           updateAlbumNameOptimistically(album.album_id, newName);
    //           closeModal();
    //         }}
    //         onCancel={closeModal}
    //         isOnEditor={isOnEditor}
    //       />
    //     </div>
    //   ),
    //   footer: <></>,
    // });
  };

  return handleRenameAlbum;
}
