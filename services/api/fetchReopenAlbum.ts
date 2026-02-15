import { apiMethods, getApiUrl } from './config';

export const fetchReopenAlbum = async ({
  eventToken,
}: {
  eventToken: string;
}) => {
  const url = getApiUrl({
    method: apiMethods.reopenalbum,
    params: {
      event_token: eventToken,
    },
  });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to reopen album:', error);
    throw error;
  }
};
