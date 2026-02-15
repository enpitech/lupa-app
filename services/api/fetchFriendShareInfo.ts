import { apiMethods, getApiUrl } from './config';
import { FriendShareInfoResponse } from '@/hooks/friends/receiver/types';

export const fetchFriendShareInfo = async (
  sharedToken: string
): Promise<FriendShareInfoResponse> => {
  try {
    const url = getApiUrl({
      method: apiMethods.friendshareinfo,
      params: {
        shared_token: sharedToken,
      },
    });

    const response = await fetch(url);
    const data = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to fetch friend share info');
    }

    return data;
  } catch (error) {
    console.error('Error fetching friend share info:', error);
    throw error;
  }
};
