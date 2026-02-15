import { useCallback } from 'react';
import { useModalStore } from '@/stores/modal';
// TODO: Replace with RN component
// import FriendReceiverModal from '../components/FriendReceiverModal';
import { FriendShareInfo } from '../types';

interface UseFriendReceiverModalProps {
  shareInfo: FriendShareInfo | null;
  isLoading: boolean;
  onConnect: () => void;
  onClose?: () => void;
}

export const useFriendReceiverModal = ({
  shareInfo,
  isLoading,
  onConnect,
  onClose,
}: UseFriendReceiverModalProps) => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const handleOpenModal = useCallback(() => {
    openModal({
      header: null,
      content: (
        <FriendReceiverModal
          shareInfo={shareInfo}
          isLoading={isLoading}
          onConnect={onConnect}
        />
      ),
      footer: null,
      modalWidth: 'w-1/3',
      onClose: onClose,
    });
  }, [openModal, shareInfo, isLoading, onConnect, onClose]);

  const handleCloseModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  return {
    openModal: handleOpenModal,
    closeModal: handleCloseModal,
  };
};
