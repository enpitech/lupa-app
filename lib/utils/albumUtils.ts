import { Album } from '@/stores/album/types';
import { Folder, PhotoAlbum, Image, Rect } from '@/types/tree';
import useLayoutTreeStore from '@/stores/layout';
import useAlbumTreeStore from '@/stores/albumTree';
import {
  parseSizeLayout,
  updateImageCropAndOrientation,
} from '@/lib/TreeV5/utils/layouts';
import { LAYFLAT_TYPE } from '@/utils/appConst';
import { folderMtypeEnum } from '@/utils/appConst';

export const getAlbumByToken = (token: string, albums: Album[]) => {
  return albums.find((album) => album.event_token === token);
};
export const isLayflatAlbum = (album: PhotoAlbum | null) => {
  return album?.m_treeV5.m_cover_type === 'LAYFLAT_COVER';
};
export const isFirstPage = (
  album: PhotoAlbum | null,
  pageId: number,
  countProlog = false
): boolean => {
  const firstSpread = album?.m_treeV5?.m_book_subtree?.m_spread_folders?.[0];
  const firstPageFolder = countProlog
    ? firstSpread?.m_child_folders?.[0] || firstSpread?.m_child_folders?.[1]
    : firstSpread?.m_child_folders?.[1];
  return firstPageFolder?.m_folderID === pageId;
};

export const isLockedPage = (
  album: PhotoAlbum | null,
  pageId: number
): boolean => {
  const spreads = album?.m_treeV5?.m_book_subtree?.m_spread_folders;
  const currentPage = spreads
    ?.flatMap((spread) => spread.m_child_folders || [])
    .find((page) => page?.m_folderID === Number(pageId));
  return currentPage?.m_isLocked ?? true;
};

export const getPageNum = (
  album: PhotoAlbum | null,
  m_folderID: number,
  isProlog: boolean
): number | null => {
  if (!album) return null;

  const spreadFolderIndex =
    album.m_treeV5.m_book_subtree.m_spread_folders?.findIndex((item) =>
      item?.m_child_folders?.find((folder) => folder?.m_folderID === m_folderID)
    );

  if (spreadFolderIndex === undefined || spreadFolderIndex < 0) return null;

  const folderIndex = album.m_treeV5.m_book_subtree.m_spread_folders[
    spreadFolderIndex
  ]?.m_child_folders?.findIndex((folder) => folder?.m_folderID === m_folderID);

  if (folderIndex === undefined || folderIndex < 0) return null;

  const basePageNum = spreadFolderIndex * 2 + folderIndex;

  const pageNum = basePageNum + (isProlog ? 1 : 0);

  return pageNum;
};

export const getSpreadsFoldersCount = (album: PhotoAlbum | null): number => {
  return album?.m_treeV5?.m_book_subtree?.m_spread_folders?.length ?? 0;
};

export const isLastPage = (
  album: PhotoAlbum | null,
  pageId: number,
  countProlog = false
): boolean => {
  const spreadsNum = getSpreadsFoldersCount(album);
  const lastSpread =
    album?.m_treeV5?.m_book_subtree?.m_spread_folders?.[spreadsNum - 1];
  const lastPageFolder = countProlog
    ? lastSpread?.m_child_folders?.[1] || lastSpread?.m_child_folders?.[0]
    : lastSpread?.m_child_folders?.[0];
  return lastPageFolder?.m_folderID === pageId;
};


export const getShuffleLayoutUtils = (
  layoutId: number,
  pageId: number,
  isLayFlat: boolean
) => {
  const layoutStore = useLayoutTreeStore.getState();

  const getAlternativeLayouts = () => {
    const currentLayout = layoutId
      ? isLayFlat
        ? layoutStore.getLayflatLayoutById(layoutId)
        : layoutStore.getSpeardLayoutById(layoutId)
      : null;

    if (!currentLayout) return [];

    const layouts = isLayFlat
      ? layoutStore.groupByCountLayflat[currentLayout.m_count] || []
      : layoutStore.groupByCountSpread[currentLayout.m_count] || [];

    return layouts.filter((layout) => layout.m_ID !== layoutId);
  };

  const canShuffle = () => {
    if (!pageId || !layoutId) {
      return false;
    }

    return getAlternativeLayouts().length > 0;
  };

  const shuffle = () => {
    if (!canShuffle()) return;

    useAlbumTreeStore.getState().shuffleLayout(layoutId, pageId, isLayFlat);
  };

  return {
    canShuffle,
    shuffle,
    getAlternativeLayouts,
  };
};

export const findImageByFolderId = (
  album: PhotoAlbum,
  folderId: number
): Image | undefined => {
  return album.m_treeV5?.m_book_subtree.m_tree_tmages.find(
    (image) => image.m_folderID === folderId
  );
};

export const updateImageToFitContainer = (
  image: Image | undefined,
  container: Folder
) => {
  if (!image) return;

  const dimensions = parseSizeLayout(container.m_size);
  updateImageCropAndOrientation(image, dimensions.width, dimensions.height);
};

export const removeEmptyContainers = (
  sourcePageFolder: Folder,
  sourceContainerLayoutId: number,
  isLayflat: boolean
): void => {
  if (!sourcePageFolder?.m_child_folders) return;

  const remainingImagesCount =
    sourcePageFolder.m_child_folders.filter(
      (folder) =>
        folder &&
        folder.m_folderID !== 0 &&
        folder.m_type !== folderMtypeEnum.TEXT_TYPE
    )?.length || 0;

  if (remainingImagesCount > 0) {
    const currentLayoutId = sourcePageFolder.m_layoutID;
    const currentLayout = getLayoutById(currentLayoutId);
    if (currentLayout && currentLayout.m_count > remainingImagesCount) {
      const newLayout = getLayoutWithCount(remainingImagesCount, isLayflat);
      if (newLayout) {
        sourcePageFolder.m_layoutID = newLayout.m_ID;

        sourcePageFolder.m_child_folders =
          sourcePageFolder.m_child_folders.filter(
            (folder) => !(folder && folder.m_folderID === 0)
          );
      }
    } else {
      sourcePageFolder.m_child_folders =
        sourcePageFolder.m_child_folders.filter(
          (folder) =>
            !(
              folder &&
              folder.m_layoutID === sourceContainerLayoutId &&
              folder.m_folderID === 0
            )
        );
    }
  }
};

export const getLayoutWithCount = (count: number, isLayflat: boolean) => {
  const layoutStore = useLayoutTreeStore.getState();
  return isLayflat
    ? layoutStore.getRandomFromGroupByLayflatCount(Math.max(1, count))
    : layoutStore.getRandomFromGroupBySpreadCount(Math.max(1, count));
};

export const getLayoutById = (layoutId: number) => {
  const layoutStore = useLayoutTreeStore.getState();
  return (
    layoutStore.getLayflatLayoutById(layoutId) ||
    layoutStore.getSpeardLayoutById(layoutId)
  );
};

export const findPageElement = (
  folder: Folder,
  pageId: string | number,
  isLayflat: boolean
) => {
  return isLayflat
    ? folder.m_child_folders?.[0] ?? folder.m_child_folders?.[1]
    : folder.m_child_folders?.find((f) => f?.m_folderID === pageId);
};

export const isLayflatFolder = (folder: Folder): boolean => {
  return !!folder && folder?.m_type === LAYFLAT_TYPE;
};
export const isLayflatSpread = (folder: Folder): boolean => {
  if (!folder || !folder.m_child_folders) return false;

  return folder.m_child_folders.some(
    (childFolder) => childFolder?.m_type === LAYFLAT_TYPE
  );
};
/**
 * Gets the spread folder that contains the given page ID
 */
export const getSpreadByPageId = (
  album: PhotoAlbum | null,
  pageId: number
): Folder | null => {
  if (!album) return null;

  return (
    album.m_treeV5.m_book_subtree.m_spread_folders.find((folder) =>
      folder.m_child_folders?.some((child) => child?.m_folderID === pageId)
    ) || null
  );
};

/**
 * Determines if a current folder/spread is layflat and has proper setup
 * This replaces the complex logic from useEditorPage
 */
export const isCurrentFolderLayflat = (
  album: PhotoAlbum | null,
  pageId: number
): boolean => {
  if (!album) return false;

  const currentFolder = getSpreadByPageId(album, pageId);
  if (!currentFolder || currentFolder.m_type !== LAYFLAT_TYPE) {
    return false;
  }

  return (
    !!currentFolder.m_child_folders &&
    ((currentFolder.m_child_folders[0] !== null &&
      currentFolder.m_child_folders[0]?.m_type ===
        folderMtypeEnum.IMAGE_TYPE) ||
      currentFolder.m_child_folders[0]?.m_type === LAYFLAT_TYPE)
  );
};
export const findParentFolderByPageId = (
  album: PhotoAlbum,
  pageId: number
): Folder | null => {
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) return null;
  const isLayflat = isCurrentFolderLayflat(album, pageId);
  // Search through all spread folders to find the one that contains the pageId
  for (const spreadFolder of album.m_treeV5.m_book_subtree.m_spread_folders) {
    if (!spreadFolder?.m_child_folders) continue;

    // Check if any direct child has the pageId we're looking for
    const hasChildWithPageId = spreadFolder.m_child_folders.some(
      (child) => child?.m_folderID === pageId
    );

    if (hasChildWithPageId) {
      return spreadFolder;
    }

    // If layflat, also search recursively in nested folders
    if (!isLayflat) {
      for (const childFolder of spreadFolder.m_child_folders) {
        if (childFolder?.m_child_folders) {
          const hasNestedChild = childFolder.m_child_folders.some(
            (nestedChild) => nestedChild?.m_folderID === pageId
          );
          if (hasNestedChild) {
            return childFolder; // This child folder is the parent
          }
        }
      }
    }
  }

  return null;
};

/**
 * Validates and fixes crop rectangle values to prevent invalid crop data
 * @param cropRect - The crop rectangle object with X, Y, Width, Height properties
 * @param sourceFile - The file name where this validation is called from (for debugging)
 * @param image - Optional image for debugging
 * @returns A valid crop rectangle with corrected values
 */
export function validateAndFixCropRect(
  cropRect: Rect | undefined | null,
  sourceFile: string,
  image: Image | undefined | null
): Rect {
  if (!cropRect || !image) {
    // For empty or null cropRect/image, return default crop (empty container)
    return { X: 0, Y: 0, Width: 1, Height: 1 };
  }

  const originalCrop = { ...cropRect };
  let hasErrors = false;

  // Validate X and Y coordinates
  const isXValid = Number.isFinite(cropRect.X) && cropRect.X >= 0;
  const isYValid = Number.isFinite(cropRect.Y) && cropRect.Y >= 0;

  if (!isXValid || !isYValid) {
    cropRect.X = 0;
    cropRect.Y = 0;
    hasErrors = true;
  }

  // Validate Width and Height
  const isWidthValid = Number.isFinite(cropRect.Width) && cropRect.Width > 0;
  const isHeightValid = Number.isFinite(cropRect.Height) && cropRect.Height > 0;

  if (!isWidthValid || !isHeightValid) {
    cropRect.Width = 1;
    cropRect.Height = 1;
    hasErrors = true;
  }

  // Log errors for debugging
  if (hasErrors) {
    console.error(`[${sourceFile}] Fixed invalid crop_rect:`, {
      image: image,
      originalCrop,
      fixed: cropRect,
      sourceFile,
    });
  }

  return cropRect;
}
