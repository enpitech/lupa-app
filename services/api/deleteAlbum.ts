import { apiMethods, getApiUrl } from './config';

export const deleteAlbum = async ({ eventToken }: { eventToken: string }) => {
  const url = getApiUrl({
    method: apiMethods.deleteAlbum,
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
    console.error('Error deleting album:', error);
    throw error;
  }
};
