import { getApiUrl, apiMethods } from './config';

export const closeAlbumCovers = async (eventToken: string) => {
  try {
    const url = getApiUrl({
      method: apiMethods.closealbumbookcovers,
      params: { event_token: eventToken },
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to close album covers:', error);
    throw error;
  }
};
