import {
  InviteType,
  ChangeFriendInviteTypeResponse,
} from '@/hooks/friends/admin/types';
import { apiMethods, getApiUrl } from './config';

export const changeFriendInviteType = async (
  eventToken: string,
  linkType: InviteType
): Promise<ChangeFriendInviteTypeResponse> => {
  const url = getApiUrl({
    method: apiMethods.friendchange,
    params: {
      event_token: eventToken,
      link_type: linkType,
    },
  });

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChangeFriendInviteTypeResponse = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to change invite type');
    }

    return data;
  } catch (error) {
    console.error('Error changing friend invite type:', error);
    throw error;
  }
};
