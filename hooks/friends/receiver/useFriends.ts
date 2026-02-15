import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchFriendShareInfo } from '@/services/api/fetchFriendShareInfo';
import { approveFriendRequest } from '@/services/api/approveFriendRequest';
import { FriendShareInfoResponse, FriendRequestResponse } from '../types';

export const useFriendShareInfo = (sharedToken: string | null) => {
  return useQuery<FriendShareInfoResponse>({
    queryKey: ['friendShareInfo', sharedToken],
    queryFn: () => {
      if (!sharedToken) {
        throw new Error('Shared token is required');
      }
      return fetchFriendShareInfo(sharedToken);
    },
    enabled: !!sharedToken,
  });
};

export const useFriendRequest = (
  onSuccess?: (data: FriendRequestResponse) => void
) => {
  return useMutation({
    mutationFn: (sharedToken: string) => approveFriendRequest(sharedToken),
    onSuccess: onSuccess,
    onError: (error) => {
      console.error('Failed to approve friend request:', error);
    },
  });
};
