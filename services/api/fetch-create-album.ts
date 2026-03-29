import type { Album } from '@/types/album';
import { apiMethods, getApiUrl } from './config';

export interface CreateAlbumParams {
  albumName: string;
  eventType?: string;
  language: string;
}

export const fetchCreateAlbum = async ({
  albumName,
  eventType = 'REGULAR',
  language,
}: CreateAlbumParams): Promise<Album> => {
  const url = getApiUrl({
    method: apiMethods.updatealbum,
    params: {
      album_name: albumName,
      event_type: eventType,
      flipbook_new: 'true',
      lang: language,
    },
  });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.isValid) {
    throw new Error(data.Error ?? `API error: ${data.errorCode}`);
  }

  return data.payload as Album;
};
