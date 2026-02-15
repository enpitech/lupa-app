import { getApiUrl, apiMethods } from './config';
import { ERROR_CODES } from '@/utils/appConst';

export const fetchUserAlbums = async () => {
  try {
    const response = await fetch(getApiUrl({ method: apiMethods.userAlbums }));
    const data = await response.json();

    if (data?.Error === ERROR_CODES.CUSTOM_MESSAGE) {
      return data;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return data.payload;
  } catch (error) {
    console.error('Failed to fetch user albums:', error);
    throw error;
  }
};
