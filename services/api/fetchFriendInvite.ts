import { FriendInviteResponse, InviteType } from '@/hooks/friends/admin/types';
import { apiMethods, getApiUrl } from './config';
import { friendsInviteTypeEnum } from '@/utils/appConst';
export const fetchFriendInvite = async (
  eventToken: string,
  linkType: InviteType = friendsInviteTypeEnum.PUBLIC
): Promise<FriendInviteResponse> => {
  const url = getApiUrl({
    method: apiMethods.friendinvite2,
    params: {
      event_token: eventToken,
      link_type: linkType,
    },
  });
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const message = `Failed to fetch friend invite link: ${response.statusText}`;
      throw new Error(message);
    }
    const data: FriendInviteResponse = await response.json();

    if (!data) {
      throw new Error('Empty response from friend invite API');
    }

    if (!data.isValid) {
      throw new Error(data.Error || 'Invalid response from friend invite API');
    }

    return data;
  } catch (error) {
    console.error('Error changing friend invite type:', error);
    throw error;
  }
};
