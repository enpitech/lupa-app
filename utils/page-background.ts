import { getBackgroundImageUrl } from '@/services/api/config';
import type { Folder, PhotoAlbum } from '@/types/tree';

export type PageBackground = {
  color?: string;
  imageUrl?: string;
};

/**
 * Resolves a background value (color or picture ID) to either a solid color
 * or an image URL from the resources server.
 */
export function resolveBackground(
  pictureId: string | null | undefined,
  album: PhotoAlbum,
  eventToken: string
): PageBackground {
  if (!pictureId) return {};

  if (pictureId.includes('#')) {
    return { color: pictureId.replace('#FF', '#') };
  }

  const tree = album.m_treeV5;
  const imageUrl = getBackgroundImageUrl({
    pictureId,
    albumToken: eventToken,
    albumTheme: tree.m_album_theme,
    format: tree.m_format,
    coverTheme: tree.m_cover_theme,
    coverFamily: tree.m_cover_family,
  });

  return { imageUrl };
}

/**
 * Resolves the background for a page folder from its m_background data.
 */
export function resolvePageBackground(
  page: Folder,
  album: PhotoAlbum,
  eventToken: string
): PageBackground {
  return resolveBackground(
    page.m_background?.m_color_im_id,
    album,
    eventToken
  );
}
