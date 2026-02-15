import { useTranslation } from '@/hooks/useTranslation';
import { useModalStore } from '@/stores/modal';
import { useCallback } from 'react';
// TODO: Replace with RN component
// import { FriendReceiverModalContent } from '../components/FriendReceiverModalContent';
import { FriendShareInfo, modalVariantEnum } from '../types';

export const useFriendSuccessModal = () => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);
  const { t } = useTranslation();

  const openSuccessModal = useCallback(
    (shareInfo: FriendShareInfo) => {
      openModal({
        header: null,
        content: (
          <FriendReceiverModalContent
            variant={modalVariantEnum.APPROVED}
            infoText={t('friends.receiver.approved.info')}
            description={t('friends.receiver.approved.description', {
              book_name: shareInfo.event_name,
              owner: shareInfo.master_name,
            })}
            testId="approval-success-modal"
          />
        ),
        footer: null,
        modalWidth: 'w-1/3',
      });
    },
    [openModal, t]
  );

  return {
    openSuccessModal,
    closeModal,
  };
};
