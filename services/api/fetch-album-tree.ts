import type { PhotoAlbum } from '@/types/tree';
import { getEditorUrl } from './config';

export const fetchAlbumTree = async ({
  eventToken,
  token,
}: {
  eventToken: string;
  token?: string;
}): Promise<PhotoAlbum> => {
  const url = getEditorUrl({
    method: 'gettreelayouts3',
    eventToken,
    params: token ? { token } : undefined,
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.payload?.m_treeMessage ?? data;
};
