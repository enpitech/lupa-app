import { FriendListResponse } from '@/hooks/friends/admin/types';
import { apiMethods, getApiUrl } from './config';

export const fetchFriendList = async (
  eventToken: string
): Promise<FriendListResponse> => {
  const url = getApiUrl({
    method: apiMethods.friendlist,
    params: {
      event_token: eventToken,
    },
  });
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const message = `Failed to fetch friends list: ${response.statusText}`;
      throw new Error(message);
    }
    const data: FriendListResponse = await response.json();

    if (!data) {
      throw new Error('Empty response from friends list API');
    }

    if (!data.isValid) {
      throw new Error(data.Error || 'Invalid response from friends list API');
    }

    return data;
  } catch (error) {
    console.error('Error fetching friends list:', error);
    throw error;
  }
};
