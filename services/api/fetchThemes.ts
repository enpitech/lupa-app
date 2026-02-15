import { getApiUrl, apiMethods } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export const fetchThemes = async ({
  token,
  event_token,
  language,
  format,
  direction,
  imageCount,
  density,
}: {
  token: string;
  event_token: string;
  language: string;
  format: string;
  direction: string;
  imageCount: number;
  density: string;
}) => {
  const params: Record<string, string> = {
    image_count: imageCount.toString(),
    lang: language,
    token,
    event_token,
    format,
    direction,
  };

  // Add layout parameter only if album has Magazine layouts
  if (density === 'magazine') {
    params.layout = 'layout_c';
  }

  try {
    const response = await fetch(
      getApiUrl({
        method: apiMethods.albumthemescategories,
        params,
      })
    );

    if (!response.ok) {
      return Promise.reject({
        errorId: 'FETCH_THEMES_FAILED',
        statusCode: response.status,
        message: `Failed to fetch themes: ${response.statusText}`,
      });
    }

    const data = await response.json();

    if (!data.payload) {
      return Promise.reject({
        errorId: 'INVALID_THEMES_RESPONSE',
        message: 'Invalid response format from the server',
      });
    }

    return data;
  } catch (error) {
    trackApiError(error as Error, apiMethods.albumthemescategories, {
      statusCode: (error as { status?: number })?.status,
      eventToken: event_token,
      format,
      density,
      imageCount,
    });
    throw error;
  }
};
