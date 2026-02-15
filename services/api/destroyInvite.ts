import { apiMethods, getApiUrl } from './config';
import { DestroyInviteResponse } from '@/hooks/friends/admin/types';

export const destroyInvite = async (
  eventToken: string
): Promise<DestroyInviteResponse> => {
  const url = getApiUrl({
    method: apiMethods.frienddestroy,
    params: {
      event_token: eventToken,
    },
  });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DestroyInviteResponse = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to destroy invite');
    }

    return data;
  } catch (error) {
    console.error('Error destroying invite:', error);
    throw error;
  }
};
