import { apiMethods, getApiUrl } from './config';
import { DeleteFriendResponse } from '@/hooks/friends/admin/types';

export const deleteFriend = async (
  eventToken: string,
  masterToken: string
): Promise<DeleteFriendResponse> => {
  const url = getApiUrl({
    method: apiMethods.frienddelete,
    params: {
      event_token: eventToken,
      master_token: masterToken,
    },
  });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DeleteFriendResponse = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to delete friend');
    }

    return data;
  } catch (error) {
    console.error('Error deleting friend:', error);
    throw error;
  }
};
