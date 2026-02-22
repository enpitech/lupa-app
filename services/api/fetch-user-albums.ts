import type { Album } from '@/types/album';
import { getApiUrl } from './config';

export const fetchUserAlbums = async (): Promise<Album[]> => {
  const response = await fetch(getApiUrl({ method: 'userAlbums' }));

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.payload;
};
