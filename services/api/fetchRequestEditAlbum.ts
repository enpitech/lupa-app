import { apiMethods, getApiUrl } from './config';

export const fetchRequestEditAlbum = async (eventToken: string) => {
  const url = getApiUrl({
    method: apiMethods.requesteditalbum,
    params: {
      event_token: eventToken,
    },
  });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.isValid) {
      throw new Error(data.Error || `API Error: ${data.errorCode}`);
    }
    return data;
  } catch (error) {
    console.error('Error fetching edit album request:', error);
    throw error;
  }
};
