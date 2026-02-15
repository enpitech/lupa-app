import { getApiUrl, apiMethods } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export interface CloseAlbumParams {
  eventToken: string;
  lang: string;
  format: string;
  density: string;
  direction: string;
  album_theme: string;
  is_cover_edited: boolean;
  flipbook_new: boolean;
}

export const closeAlbum = async (params: CloseAlbumParams) => {
  const {
    eventToken,
    lang,
    format,
    density,
    direction,
    album_theme,
    is_cover_edited,
    flipbook_new,
  } = params;
  const urlParams = new URLSearchParams();

  const apiParams: Record<string, string> = {
    event_token: eventToken,
    lang,
    format,
    density,
    direction,
    album_theme,
    is_cover_edited: is_cover_edited.toString(),
    flipbook_new: flipbook_new.toString(),
  };

  // Add layout parameter only if album has Magazine layouts
  if (density === 'magazine') {
    apiParams.layout = 'layout_c';
  }

  try {
    const response = await fetch(
      getApiUrl({
        method: apiMethods.closealbum3,
        params: apiParams,
      }),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlParams,
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { payload } = await response.json();
    return payload;
  } catch (error) {
    trackApiError(error as Error, apiMethods.closealbum3, {
      method: 'POST',
      statusCode: (error as { status?: number })?.status,
      eventToken,
      format,
      density,
    });
    throw error;
  }
};
