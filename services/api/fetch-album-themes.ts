import { apiMethods, getApiUrl } from './config';

export interface AlbumTheme {
  id: string;
  displayName: string;
  coverFamily: string;
}

export interface AlbumThemeCategory {
  id: string;
  title: string;
  themes: AlbumTheme[];
}

export interface AlbumThemeDesign {
  id: string;
  title: string;
  categories: AlbumThemeCategory[];
}

export const fetchAlbumThemes = async ({
  eventToken,
  format,
  direction,
  lang,
}: {
  eventToken: string;
  format: string;
  direction: string;
  lang: string;
}): Promise<AlbumThemeDesign[]> => {
  const url = getApiUrl({
    method: apiMethods.albumthemescategories,
    params: {
      event_token: eventToken,
      format,
      direction,
      lang,
      image_count: '0',
    },
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

  const data = await response.json();
  if (!data.isValid) throw new Error(data.Error ?? `API error: ${data.errorCode}`);

  return (data.payload?.designsNew ?? []) as AlbumThemeDesign[];
};
