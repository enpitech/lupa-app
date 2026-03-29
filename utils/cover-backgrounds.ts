import { env } from '@/config/env';
import { getBackgroundImageUrl } from '@/services/api/config';
import { useUserStore } from '@/stores/user';
import type { Folder, PhotoAlbum } from '@/types/tree';

export type CoverBackgroundData = {
  color: string | null;
  imageUrl: string | null;
};

const EMPTY: CoverBackgroundData = { color: null, imageUrl: null };

/**
 * Build a cover-specific background URL using the album's cover URL information.
 * This is the primary method for cover backgrounds — it uses pre-built query
 * params stored in `m_cover_subtree.m_url_information`.
 */
function buildCoverResourcesUrl(
  album: PhotoAlbum,
  folder: Folder
): string | null {
  const urlInfoOptions = album.m_treeV5.m_cover_subtree.m_url_information;
  const urlInfo =
    urlInfoOptions?.find((info) => info.m_folderID === folder.m_folderID) ||
    urlInfoOptions?.[0];
  const queryParams = urlInfo?.m_urlInfo;
  if (!queryParams) return null;

  const pictureName = folder.m_background?.m_color_im_id;
  const user = useUserStore.getState().user;

  const defaultParams: Record<string, string> = {
    picture: pictureName ?? '',
    size: 'medium',
    isCustomErr: 'false',
    cloudcode: env.CLOUD_CODE,
    app_version: '3.5.27.tf',
    device_type: 'mobile',
    token: user?.token ?? '',
  };

  const extraParams = Object.entries(defaultParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${env.RESOURCES_IMAGE_URL}?${queryParams}&${extraParams}`;
}

/**
 * Resolve background for a cover region folder.
 * Priority: cover resources URL > fallback background image URL > solid color.
 */
function getCoverBackground(
  folder: Folder,
  album: PhotoAlbum
): CoverBackgroundData {
  const background = folder.m_background;
  if (!background || background.m_direction_type_bg === 'DO_NOTHING') {
    return EMPTY;
  }

  const pictureId = background.m_color_im_id ?? null;
  const isColor = pictureId != null && pictureId.includes('#');
  const color = isColor ? pictureId.replace('#FF', '#') : null;

  // 1) Prefer the cover resources URL (covers with special URL info)
  const resourcesUrl = buildCoverResourcesUrl(album, folder);

  // 2) Fallback: build from pictureId if it's not a color
  const tree = album.m_treeV5;
  const imageUrl = resourcesUrl
    ? resourcesUrl
    : pictureId && !isColor
      ? getBackgroundImageUrl({
          pictureId,
          albumToken: tree.m_album_token,
          albumTheme: tree.m_album_theme,
          format: tree.m_format,
          coverTheme: tree.m_cover_theme,
          coverFamily: tree.m_cover_family,
        })
      : null;

  return { color, imageUrl };
}

/**
 * Resolve front cover and back cover background data from the album tree.
 * RTL: front cover = left region, back cover = right region.
 * LTR: front cover = right region, back cover = left region.
 */
export function resolveCoverBackgrounds(album: PhotoAlbum): {
  albumDirection: string;
  frontCoverBackground: CoverBackgroundData;
  backCoverBackground: CoverBackgroundData;
} {
  const albumDirection =
    album.m_treeV5.m_album_direction?.toString().toUpperCase() || 'RTL';

  const coverRoot = album.m_treeV5.m_cover_subtree.m_spread_folders?.[0];
  if (!coverRoot) {
    return { albumDirection, frontCoverBackground: EMPTY, backCoverBackground: EMPTY };
  }

  const children = (coverRoot.m_child_folders ?? []).filter(Boolean) as Folder[];
  const rightRegion = children.find(
    (f) => f.m_type === 'COVER_RIGHT_REGION_TYPE'
  );
  const leftRegion = children.find(
    (f) => f.m_type === 'COVER_LEFT_REGION_TYPE'
  );

  const frontRegion = albumDirection === 'RTL' ? leftRegion : rightRegion;
  const backRegion = albumDirection === 'RTL' ? rightRegion : leftRegion;

  return {
    albumDirection,
    frontCoverBackground: frontRegion
      ? getCoverBackground(frontRegion, album)
      : EMPTY,
    backCoverBackground: backRegion
      ? getCoverBackground(backRegion, album)
      : EMPTY,
  };
}
