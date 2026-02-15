import { getApiUrl, apiMethods } from './config';
import { ALBUM_PROGRESS_STATUS } from '@/utils/appConst';
export const fetchAlbumProgress = async ({
  token = '',
  event_token = '',
}: {
  token?: string;
  event_token?: string;
}) => {
  try {
    const response = await fetch(
      getApiUrl({
        method: apiMethods.albumprogress,
        params: {
          token,
          event_token,
        },
      })
    );

    if (!response.ok) {
      return Promise.reject({
        errorId: 'FETCH_ALBUM_PROGRESS_FAILED',
        statusCode: response.status,
        message: `Failed to fetch album progress: ${response.statusText}`,
      });
    }

    const data = await response.json();

    if (
      !data.payload ||
      ALBUM_PROGRESS_STATUS.ERROR_STATUSES.includes(
        data.payload.progress_status
      )
    ) {
      return Promise.reject({
        errorId: 'INVALID_ALBUM_PROGRESS_RESPONSE',
        message: 'Invalid response format from the server',
      });
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch album progress:', error);
    throw error;
  }
};
