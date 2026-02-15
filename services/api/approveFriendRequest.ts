import { apiMethods, getApiUrl } from './config';
import { FriendRequestResponse } from '@/hooks/friends/receiver/types';

export const approveFriendRequest = async (
  sharedToken: string
): Promise<FriendRequestResponse> => {
  try {
    const url = getApiUrl({
      method: apiMethods.friendrequest,
      params: {
        shared_token: sharedToken,
      },
    });

    const response = await fetch(url);
    const data = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to approve friend request');
    }

    return data;
  } catch (error) {
    console.error('Error approving friend request:', error);
    throw error;
  }
};
