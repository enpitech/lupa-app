import { buildBackgroundImageUrl } from '@/lib/TreeV5/utils/album';
import { Background, Folder, Frame, PhotoAlbum } from '@/types/tree';
import { User } from '@/types/user';
import { CSSProperties } from 'react';
import { useUserStore } from '@/stores/user';
import { parseSizeLayout } from '@/lib/TreeV5/utils/layouts';
import { env } from '@/config/env';

export const shouldShowLayoutBackground = (
  isCover: boolean,
  isSideBar: boolean,
  isCoverRightRegion: boolean,
  isAlbumDirectionLTR: boolean
): boolean => {
  const isLtrCoverSidebarRightPage =
    isCover && isSideBar && isCoverRightRegion && isAlbumDirectionLTR;
  return !isLtrCoverSidebarRightPage;
};

export const getBackgroundProps = (
  background: string,
  shouldShowBackgroundImage: boolean
): CSSProperties => {
  if (!background) {
    return { backgroundColor: 'none' };
  }
  const isBackgroundColor = background.includes('#');
  const backgroundColor = shouldShowBackgroundImage ? background : 'none';
  const backgroundImage = shouldShowBackgroundImage
    ? `url(${background})`
    : 'none';

  return isBackgroundColor
    ? { backgroundColor }
    : {
        backgroundImage,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      };
};

export const getBackgroundPosition = (
  isCover: boolean,
  isCoverRightRegion: boolean,
  isAlbumDirectionLTR?: boolean
): string => {
  if (!isCover) return 'center';

  // For LTR single cover page or back cover, show same side
  if (isAlbumDirectionLTR) {
    return isCoverRightRegion ? 'right' : 'left';
  }

  // Default behavior for full spread or non-LTR - show opposite side
  return !isCoverRightRegion ? 'right' : 'left';
};

// Build a resources image URL for the cover based on album url information and folder
export function buildCoverResourcesImageUrlFromAlbum(
  albumObj: PhotoAlbum | null,
  folder: Folder,
  userObj: User | null,
  lang: string = 'en'
): string | null {
  const urlInfoOptions = albumObj?.m_treeV5?.m_cover_subtree?.m_url_information;
  // Try to match the specific folder; if not found, fall back to the first available entry
  const urlInfo =
    urlInfoOptions?.find((info) => info.m_folderID === folder.m_folderID) ||
    urlInfoOptions?.[0];
  const queryParams = urlInfo?.m_urlInfo;
  if (!queryParams) return null;

  // const isAlbumLTR = albumObj?.m_treeV5?.m_album_direction === 'LTR';
  const pictureName = folder.m_background?.m_color_im_id;

  const defaultParams = {
    picture: pictureName,
    size: 'medium',
    isCustomErr: 'false',
    cloudcode: env.CLOUD_CODE,
    app_version: '3.5.78.d',
    device_type: 'desktop',
    lang,
    token: userObj?.token ?? '',
  };

  const allParams = Object.entries(defaultParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return `${env.RESOURCES_IMAGE_URL}?${queryParams}&${allParams}`;
}

export const createDropZoneStyle = (
  pageWidth: number,
  pageHeight: number,
  backgroundPosition: string,
  backgroundProps: CSSProperties,
  isSideBar: boolean,
  shouldApplyShadow: boolean = true
): CSSProperties => {
  return {
    width: `${pageWidth}px`,
    height: `${pageHeight}px`,
    backgroundPosition,
    ...(!isSideBar && {
      borderRadius: 4,
      backgroundClip: 'padding-box',
      ...(shouldApplyShadow && {
        boxShadow: '0 2px 6px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.12)',
      }),
    }),
    ...backgroundProps,
  };
};

export const getPageBackground = (
  layout: Folder,
  album: PhotoAlbum | null,
  user: User | null
) => {
  if (!layout) {
    return '';
  }
  const curPageChildBackground = layout.m_background;
  const pictureId = curPageChildBackground?.m_color_im_id;

  if (pictureId && pictureId.indexOf('#') > -1) {
    return pictureId.replace('#FF', '#');
  }

  const imgUrl = buildBackgroundImageUrl(
    pictureId ? pictureId : '',
    album,
    user
  );
  return imgUrl;
};

// Similar to getPageBackground but named explicitly for cover usage.
export const getCoverBackground = (
  layout: Folder,
  album: PhotoAlbum | null,
  user: User | null
) => {
  // Ensure we have a token even if user is not provided
  const effectiveUser = user ?? useUserStore.getState().user ?? null;
  // 1) Prefer the cover resources image (constructed from album cover url info)
  const resourcesUrl = buildCoverResourcesImageUrlFromAlbum(
    album,
    layout,
    effectiveUser
  );
  // 2) Compute color from background if solid
  const background = layout.m_background;
  if (!background || background.m_direction_type_bg === 'DO_NOTHING') {
    return { color: null, imageUrl: null };
  }
  const pictureId = background?.m_color_im_id || null;
  const color =
    pictureId && pictureId.indexOf('#') > -1
      ? pictureId.replace('#FF', '#')
      : null;
  // 3) Fallback image URL from pictureId if not a color and no resources URL
  const imageUrl = resourcesUrl
    ? resourcesUrl
    : pictureId && !color
    ? buildBackgroundImageUrl(pictureId, album, effectiveUser)
    : null;

  return { color, imageUrl };
};

type CoverBackgroundData = { color: string | null; imageUrl: string | null };
const EMPTY_COVER_BACKGROUND: CoverBackgroundData = {
  color: null,
  imageUrl: null,
};

export const resolveCoverBackgrounds = (
  album: PhotoAlbum | null
): {
  albumDirection: string;
  coverRoot?: Folder;
  backgroundColorImageUrl: CoverBackgroundData;
  frontCoverBackgroundData: CoverBackgroundData;
  backCoverBackgroundData: CoverBackgroundData;
} => {
  const albumDirection =
    album?.m_treeV5?.m_album_direction?.toString().toUpperCase() || 'RTL';

  const coverRoot = album?.m_treeV5?.m_cover_subtree?.m_spread_folders?.[0] as
    | Folder
    | undefined;
  const childFolders = (coverRoot?.m_child_folders || []) as Array<
    Folder | null
  >;
  const rightRegion = childFolders.find(
    (f) => f?.m_type === 'COVER_RIGHT_REGION_TYPE'
  ) as Folder | undefined;
  const leftRegion = childFolders.find(
    (f) => f?.m_type === 'COVER_LEFT_REGION_TYPE'
  ) as Folder | undefined;

  // RTL: front is LEFT, LTR: front is RIGHT
  const frontCoverRegion = albumDirection === 'RTL' ? leftRegion : rightRegion;
  const backCoverRegion = albumDirection === 'RTL' ? rightRegion : leftRegion;

  const backgroundColorImageUrl = coverRoot
    ? getCoverBackground(coverRoot, album, null)
    : EMPTY_COVER_BACKGROUND;

  const frontCoverBackgroundData = frontCoverRegion
    ? getCoverBackground(frontCoverRegion, album, null)
    : EMPTY_COVER_BACKGROUND;

  const backCoverBackgroundData = backCoverRegion
    ? getCoverBackground(backCoverRegion, album, null)
    : EMPTY_COVER_BACKGROUND;

  return {
    albumDirection,
    coverRoot,
    backgroundColorImageUrl,
    frontCoverBackgroundData,
    backCoverBackgroundData,
  };
};

export const calculatePageDimensions = (
  layout: Folder | null | undefined,
  pageWidth: number,
  maxPageHeight: number
): { width: number; height: number } => {
  if (!layout?.m_size) {
    return { width: pageWidth, height: maxPageHeight };
  }

  let pageWidthToRender = pageWidth;

  const { height, width } = parseSizeLayout(layout.m_size);

  let pageHeightToRender = (pageWidth * height) / width;

  if (pageHeightToRender > maxPageHeight) {
    pageHeightToRender = maxPageHeight;
    pageWidthToRender = (maxPageHeight * width) / height;
  }

  return { width: pageWidthToRender, height: pageHeightToRender };
};

export const calculateSidebarItemHeight = (
  layout: Folder | null | undefined,
  pageWidth: number
): number => {
  if (!layout || !pageWidth) return 0;

  const pagesCount = layout.m_child_folders?.length || 1;
  const { width, height } = parseSizeLayout(layout.m_size);
  if (!width || !height) return 0;

  const perPageWidth = pagesCount > 1 ? width / pagesCount : width;
  const perPageHeightPx = (pageWidth * height) / perPageWidth;

  return perPageHeightPx;
};

export function createBackgroundFromFrame(frame?: Frame): Background {
  return {
    m_unique_id: frame?.m_unique_id || 0,
    m_direction_type_bg: 'DO_NOTHING',
    m_theme_name: '',
    m_theme_family: '',
    m_permissions: 0,
    m_dummyField: null,
    m_color_im_id: frame?.m_font_bg_image_or_color || null,
    m_bg_opacity: frame?.m_font_bg_opacity || 0,
  };
}
export function createBackgroundFromBg(bg?: Background): Background {
  return {
    m_unique_id: bg?.m_unique_id || 0,
    m_direction_type_bg: 'DO_NOTHING',
    m_theme_name: bg?.m_theme_name || '',
    m_theme_family: bg?.m_theme_family || '',
    m_permissions: bg?.m_permissions || 0,
    m_dummyField: null,
    m_color_im_id: bg?.m_color_im_id || null,
    m_bg_opacity: bg?.m_bg_opacity || 0,
  };
}
