import { apiMethods, getApiUrl } from './config';

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

export const fetchCloseAlbum = async ({
  eventToken,
  lang,
  format,
  density,
  direction,
  album_theme,
  is_cover_edited,
  flipbook_new,
}: CloseAlbumParams): Promise<void> => {
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

  if (density === 'magazine') {
    apiParams.layout = 'layout_c';
  }

  const url = getApiUrl({
    method: apiMethods.closealbum3,
    params: apiParams,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: '',
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
};
