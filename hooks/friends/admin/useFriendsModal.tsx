import React, { useCallback } from 'react';
import { useModalStore } from '@/stores/modal';
import useAlbumStore from '@/stores/album';
// TODO: Replace with RN components
// import { FriendsModalHeader } from '@/pages/friends/admin/components/FriendsModalHeader';
// import { FriendsModalContent } from '@/pages/friends/admin/components/FriendsModalContent';
// import { FriendsModalFooter } from '@/pages/friends/admin/components/FriendsModalFooter';

interface UseFriendsModalProps {
  eventToken: string;
}

export const useFriendsModal = ({ eventToken }: UseFriendsModalProps) => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const album = useAlbumStore((state) => state.album);

  const handleCloseModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleOpenModal = useCallback(
    (event?: React.MouseEvent) => {
      if (event) event.stopPropagation();

      const isEmpty = (album?.members_count || 0) === 0;

      openModal({
        header: <FriendsModalHeader isEmptyFriendsModal={isEmpty} />,
        content: (
          <FriendsModalContent
            onClose={handleCloseModal}
            eventToken={eventToken}
          />
        ),
        footer: <FriendsModalFooter onClose={handleCloseModal} />,
        modalWidth: 'w-1/2',
        confirmModal: false,
      });
    },
    [openModal, handleCloseModal, eventToken, album?.members_count]
  );

  return { handleOpenModal };
};
