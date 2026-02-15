import { apiMethods, getApiUrl } from './config';
import { ERROR_CODES } from '@/utils/appConst';

export const fetchAlbumsByEventToken = async ({
  eventToken,
}: {
  eventToken: string;
}) => {
  const url = getApiUrl({
    method: apiMethods.albumsByEventToken,
    params: { event_token: eventToken, show_basket: 'true' },
  });
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data?.Error === ERROR_CODES.CUSTOM_MESSAGE) {
      return data;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch albums by event token:', error);
    throw error;
  }
};
