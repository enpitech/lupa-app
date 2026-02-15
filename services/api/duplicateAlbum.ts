import { apiMethods, getApiUrl } from './config';

export const duplicateAlbum = async ({
  eventToken,
}: {
  eventToken: string;
}) => {
  try {
    const url = getApiUrl({
      method: apiMethods.duplicateAlbum,
      params: {
        event_token: eventToken,
      },
    });
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.isValid) {
      throw new Error(data.Error || 'Failed to duplicate album');
    }

    return data;
  } catch (error) {
    console.error('Error duplicating album:', error);
    throw error;
  }
};
