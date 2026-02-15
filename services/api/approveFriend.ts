import { apiMethods, getApiUrl } from './config';

import { ApproveFriendResponse } from '@/hooks/friends/admin/types';

export const approveFriend = async (
  eventToken: string,
  masterToken: string
): Promise<ApproveFriendResponse> => {
  const url = getApiUrl({
    method: apiMethods.friendapproved,
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

    const data: ApproveFriendResponse = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to approve friend');
    }

    return data;
  } catch (error) {
    console.error('Error approving friend:', error);
    throw error;
  }
};
