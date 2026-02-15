import { useEffect } from 'react';
// TODO: Replace with React Navigation equivalents
// import { useSearchParams, useNavigate } from 'react-router-dom';
import { useFriendShareInfo, useFriendRequest } from './useFriends';
import { useFriendReceiverModal } from './useFriendReceiverModal';
import { useFriendSuccessModal } from './useFriendSuccessModal';
import { friendsInviteTypeEnum } from '@/utils/appConst';
import { PATHS } from '@/utils/appConst';
import { FriendRequestResponse } from '../types';
import { sendEvent } from '@/utils/analytics';

export const useSharedToken = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const sharedToken = searchParams.get('shared_token');

  const { data: shareInfo, isLoading, error } = useFriendShareInfo(sharedToken);
  const { openSuccessModal } = useFriendSuccessModal();

  const deleteSharedToken = () => {
    // Remove shared_token from URL
    searchParams.delete('shared_token');
    setSearchParams(searchParams, { replace: true });
  };

  const friendApprovalMutation = useFriendRequest(
    (friendrequestInfo: FriendRequestResponse) => {
      if (!shareInfo?.payload) return;

      const { is_closed } = shareInfo.payload;
      const { event_link_type, event_token } = friendrequestInfo.payload;

      // Remove token from URL and close modal
      deleteSharedToken();
      closeModal();

      // For PRIVATE invites: Show success modal
      if (event_link_type.toLowerCase() === friendsInviteTypeEnum.PRIVATE) {
        openSuccessModal(shareInfo.payload);
      } else {
        // For PUBLIC invites
        if (event_token && is_closed) {
          // Album closed, go to preview
          navigate(`${PATHS.PREVIEW}/${event_token}`);
        } else if (event_token) {
          // Album is open, go to photo stack
          navigate(`${PATHS.PHOTO_STACK}/${event_token}`);
        }
      }
    }
  );

  const handleConnect = () => {
    if (!shareInfo?.payload) return;
    sendEvent('online_friend_enter_book', {
      type:
        shareInfo.payload.sharing_status?.toLowerCase() ===
        friendsInviteTypeEnum.PUBLIC
          ? 'public'
          : 'private',
    });
    friendApprovalMutation.mutate(sharedToken || '');
  };

  const { openModal, closeModal } = useFriendReceiverModal({
    shareInfo: shareInfo?.payload || null,
    isLoading,
    onConnect: handleConnect,
    onClose: deleteSharedToken, // Pass deleteSharedToken for X button and outside clicks
  });

  useEffect(() => {
    if (sharedToken && shareInfo && !isLoading) {
      openModal();
    }
  }, [sharedToken, shareInfo, isLoading, openModal]);

  return {
    sharedToken,
    shareInfo,
    isLoading,
    error,
    handleConnect,
    deleteSharedToken,
  };
};
