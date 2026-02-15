import { getApiUrl, apiMethods } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export const fetchAlbums = async () => {
  try {
    const response = await fetch(getApiUrl({ method: apiMethods.userAlbums }));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    trackApiError(error as Error, apiMethods.userAlbums, {
      statusCode: (error as { status?: number })?.status,
    });
    throw error;
  }
};
