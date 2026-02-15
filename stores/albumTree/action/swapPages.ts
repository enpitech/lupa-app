/**
 * Handles page swapping functionality in photo albums
 * Supports both regular books and layflat albums
 * @module swapPages
 */

import { Folder, PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { DragEndEvent } from '@dnd-kit/core';
import { isLayflatAlbum } from '@/lib/utils/albumUtils';
import { validateLayoutId } from '@/lib/TreeV5/utils/layoutValidation';
import { isLockedPage } from '@/lib/utils/albumUtils';
import { folderMtypeEnum } from '@/utils/appConst';
import { trackError } from '@/utils/datadogErrorTracking';
/**
 * Error codes for swap pages operations
 */
const ERROR_CODES = {
  INVALID_PAGE_IDS: 'INVALID_PAGE_IDS',
  INVALID_SPREAD_FOLDERS: 'INVALID_SPREAD_FOLDERS',
  INVALID_SPREAD_INDICES: 'INVALID_SPREAD_INDICES',
  INVALID_PAGE_INDICES: 'INVALID_PAGE_INDICES',
} as const;

type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Custom error type for swap pages operations
 * Includes specific error codes for different failure scenarios
 */
interface SwapPagesError extends Error {
  code: ErrorCode;
}

/**
 * Type for spread indices
 */
interface SpreadIndices {
  currentSpreadIndex: number;
  destinationSpreadIndex: number;
}

/**
 * Type for page IDs
 */
interface PageIds {
  activePageId: number;
  destinationPageId: number;
}

/**
 * Type for swap pages input validation result
 */
interface SwapPagesInput {
  currentPageId: number;
  destPageId: number;
  spreadFolders: Folder[];
}

/**
 * Creates a typed error for swap pages operations
 * @param message - Error message
 * @param code - Error code
 * @returns SwapPagesError
 */
const createSwapPagesError = (
  message: string,
  code: ErrorCode
): SwapPagesError => {
  const error = new Error(message) as SwapPagesError;
  error.code = code;
  return error;
};

/**
 * Validates the input parameters for page swapping
 * @param e - Drag end event containing source and destination information
 * @param album - The photo album to perform the swap on
 * @returns Object containing validated page IDs and spread folders
 * @throws SwapPagesError if validation fails
 */
const validateSwapPagesInput = (
  e: DragEndEvent,
  album: PhotoAlbum
): SwapPagesInput => {
  const { active, over } = e;
  const currentPageId = active.data.current?.pageId;
  const destPageId = over?.data.current?.pageId;

  const { m_treeV5 } = album;
  const { m_book_subtree } = m_treeV5 || {};
  const { m_spread_folders = [] } = m_book_subtree || {};

  if (!currentPageId || !destPageId || m_spread_folders.length === 0) {
    throw createSwapPagesError(
      'Invalid page IDs or empty spread folders',
      ERROR_CODES.INVALID_PAGE_IDS
    );
  }

  return { currentPageId, destPageId, spreadFolders: m_spread_folders };
};

/**
 * Checks if a page is the first or last page in the album
 * @param pageId - ID of the page to check
 * @param firstPageId - ID of the first page
 * @param lastPageId - ID of the last page
 * @returns boolean indicating if the page is first or last
 */
const isFirstOrLastPage = (
  pageId: number,
  firstPageId: number | undefined,
  lastPageId: number | undefined
): boolean => {
  return pageId === firstPageId || pageId === lastPageId;
};

/**
 * Validates if a layflat album swap is allowed
 * Prevents swapping with first or last pages in layflat albums
 * @param currentPageId - ID of the current page
 * @param destPageId - ID of the destination page
 * @param firstPageId - ID of the first page
 * @param lastPageId - ID of the last page
 * @returns boolean indicating if the swap is valid
 */
const validateLayflatSwap = (
  currentPageId: number,
  destPageId: number,
  firstPageId: number | undefined,
  lastPageId: number | undefined
): boolean => {
  return !(
    isFirstOrLastPage(currentPageId, firstPageId, lastPageId) ||
    isFirstOrLastPage(destPageId, firstPageId, lastPageId)
  );
};

/**
 * Finds the indices of the current and destination spreads
 * @param spreadFolders - Array of spread folders
 * @param currentPageId - ID of the current page
 * @param destPageId - ID of the destination page
 * @returns Object containing current and destination spread indices
 * @throws SwapPagesError if indices are not found
 */
export const findSpreadIndices = (
  spreadFolders: Folder[],
  currentPageId: number,
  destPageId: number
): SpreadIndices => {
  const currentSpreadIndex = spreadFolders.findIndex(
    (folder) => folder.m_folderID === currentPageId
  );
  let destinationSpreadIndex = spreadFolders.findIndex(
    (folder) => folder.m_folderID === destPageId
  );

  if (destinationSpreadIndex === -1) {
    const imageFolderId = destPageId;
    // its probably an image dropzone. lets find the spread that contains the image and the page
    const imageSpreadIndex = findSpreadIndexByImageFolderId(
      spreadFolders,
      imageFolderId
    );
    destinationSpreadIndex = imageSpreadIndex;
  }
  if (currentSpreadIndex === -1 || destinationSpreadIndex === -1) {
    throw createSwapPagesError(
      'Invalid spread indices',
      ERROR_CODES.INVALID_SPREAD_INDICES
    );
  }

  return { currentSpreadIndex, destinationSpreadIndex };
};

/**
 * Finds the index of the spread that contains the image folder ID
 * @param spreadFolders - Array of spread folders
 * @param imageFolderId - ID of the image folder
 * @returns Index of the spread that contains the image folder
 */
const findSpreadIndexByImageFolderId = (
  spreadFolders: Folder[],
  imageFolderId: number
) => {
  const spreadIndex = spreadFolders.findIndex((spread) => {
    return spread.m_child_folders?.some(
      (folder) => folder?.m_folderID && folder.m_folderID === imageFolderId
    );
  });
  if (spreadIndex === -1) {
    throw createSwapPagesError(
      'Invalid spread indices',
      ERROR_CODES.INVALID_SPREAD_INDICES
    );
  }
  return spreadIndex;
};

/**
 * Validates parameters for regular book page swapping
 * @param e - Drag end event
 * @param currentSpread - Current spread folder
 * @param destinationSpread - Destination spread folder
 * @returns Object containing validated page IDs
 * @throws SwapPagesError if validation fails
 */
const validateRegularBookSwap = (
  e: DragEndEvent,
  currentSpread: Folder,
  destinationSpread: Folder
): PageIds => {
  const activePageId = e.active.data?.current?.id;
  const destinationPageId =
    e.over?.data?.current?.accepts === 'image'
      ? e.over?.data?.current?.pageId
      : e.over?.data?.current?.id;

  if (
    !activePageId ||
    !destinationPageId ||
    !currentSpread?.m_child_folders ||
    !destinationSpread?.m_child_folders
  ) {
    throw createSwapPagesError(
      'Invalid page indices or missing child folders',
      ERROR_CODES.INVALID_PAGE_INDICES
    );
  }

  return {
    activePageId,
    destinationPageId,
  };
};

/**
 * Main function to handle page swapping in photo albums
 * Supports both regular books and layflat albums
 * @param e - Drag end event containing source and destination information
 * @param album - The photo album to perform the swap on
 * @returns Updated photo album with swapped pages
 */
const swapPages = (e: DragEndEvent, album: PhotoAlbum): PhotoAlbum => {
  try {
    const { currentPageId, destPageId, spreadFolders } = validateSwapPagesInput(
      e,
      album
    );

    const firstPageId = spreadFolders[0]?.m_folderID;
    const lastPageId = spreadFolders[spreadFolders.length - 1]?.m_folderID;

    const isLayflat = isLayflatAlbum(album);

    if (
      isLayflat &&
      !validateLayflatSwap(currentPageId, destPageId, firstPageId, lastPageId)
    ) {
      return album;
    }

    const updatedAlbum: PhotoAlbum = structuredClone(album);
    const updatedSpreadFolders =
      updatedAlbum.m_treeV5?.m_book_subtree?.m_spread_folders;

    if (!updatedSpreadFolders) {
      throw createSwapPagesError(
        'Invalid spread folders structure',
        ERROR_CODES.INVALID_SPREAD_FOLDERS
      );
    }

    const { currentSpreadIndex, destinationSpreadIndex } = findSpreadIndices(
      updatedSpreadFolders,
      currentPageId,
      destPageId
    );

    if (!isLayflat) {
      const currentSpread = updatedSpreadFolders[currentSpreadIndex];
      const destinationSpread = updatedSpreadFolders[destinationSpreadIndex];

      const { activePageId, destinationPageId } = validateRegularBookSwap(
        e,
        currentSpread,
        destinationSpread
      );

      if (activePageId === destinationPageId) {
        // nothing to do
        return updatedAlbum;
      }
      handleRegularBookPageMove({
        currentSpread,
        destinationSpread,
        activePageId,
        destinationPageId,
        spreadFolders: updatedSpreadFolders,
        currentSpreadIndex,
        destinationSpreadIndex,
        album: updatedAlbum,
      });
    } else {
      handleLayflatBookPageMove({
        spreadFolders: updatedSpreadFolders,
        currentSpreadIndex,
        destinationSpreadIndex,
      });
    }

    return updatedAlbum;
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error('Error in swapPages');

    trackError(errorObj, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'swapPages',
      activePageId: e.active?.data?.current?.pageId,
      destinationPageId: e.over?.data?.current?.pageId,
    });

    return album;
  }
};

export const getSwapPagesAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['swapPages']
> = (set, get) => (e: DragEndEvent) => {
  if (!e.over) {
    return;
  }
  const album = get().album;
  if (!album) {
    return;
  }

  const updatedAlbum = swapPages(e, album);

  if (updatedAlbum) {
    set({ album: updatedAlbum });
  }
};

/**
 * Handles the circular swapping of pages between spreads in a photo album
 * This function manages the complex logic of swapping pages while maintaining the album's structure
 * Locked pages are preserved in their original positions during the swap operation
 *
 * @param pagesList - List of pages to be swapped
 * @param activePageId - ID of the page being moved
 * @param destinationPageId - ID of the target page
 * @param currentSpread - The spread containing the active page
 * @param destinationSpread - The spread containing the destination page
 * @param album - The photo album to check for locked pages
 * @param backward - Flag indicating if the swap should be performed in reverse order
 *
 * @example
 * // Swap pages in forward direction
 * circularSwap({
 *   pagesList: [page1, page2, page3],
 *   activePageId: 1,
 *   destinationPageId: 3,
 *   currentSpread: spread1,
 *   destinationSpread: spread2,
 *   album: photoAlbum
 * });
 */
interface CircularSwapProps {
  pagesList: Folder[];
  activePageId: number;
  destinationPageId: number;
  currentSpread: Folder;
  destinationSpread: Folder;
  album: PhotoAlbum;
  backward?: boolean;
}

function circularSwap({
  pagesList,
  activePageId,
  destinationPageId,
  currentSpread,
  destinationSpread,
  album,
  backward = false,
}: CircularSwapProps) {
  if (!currentSpread?.m_child_folders || !destinationSpread?.m_child_folders) {
    return;
  }

  const activePageIndex = currentSpread.m_child_folders.findIndex(
    (folder) => folder?.m_folderID === activePageId
  );
  const destinationPageIndex = destinationSpread.m_child_folders.findIndex(
    (folder) => folder?.m_folderID === destinationPageId
  );

  const activePage = currentSpread.m_child_folders[activePageIndex];
  const destinationPage =
    destinationSpread.m_child_folders[destinationPageIndex];

  if (!activePage || !destinationPage) {
    return;
  }

  if (currentSpread.m_folderID === destinationSpread.m_folderID) {
    const { previousPageContents, previousPageLayoutId } =
      handleSwapItem({
        pagesList,
        pageIndex: destinationPageIndex,
        previousPageContents: structuredClone(activePage.m_child_folders),
        previousPageLayoutId: activePage.m_layoutID,
      }) ?? {};
    activePage.m_child_folders = previousPageContents as Folder[] | null;
    activePage.m_layoutID = previousPageLayoutId as number;
    return;
  }

  let previousPageContents = structuredClone(pagesList[0].m_child_folders);
  let previousPageLayoutId = pagesList[0].m_layoutID;
  if (backward) {
    for (let i = pagesList.length - 1; i >= 0; i--) {
      const currentPage = pagesList[i];
      // Skip locked pages - they should not be moved
      if (
        currentPage?.m_folderID &&
        isLockedPage(album, currentPage.m_folderID)
      ) {
        continue;
      }
      const prevPage = handleSwapItem({
        pagesList,
        pageIndex: i,
        previousPageContents,
        previousPageLayoutId,
      });
      if (prevPage) {
        previousPageContents = prevPage.previousPageContents;
        previousPageLayoutId = prevPage.previousPageLayoutId;
      }
    }
  } else {
    const activePageContents = structuredClone(activePage.m_child_folders);
    const activePageLayoutId = activePage.m_layoutID;

    for (let i = 0; i < pagesList.length; i++) {
      const currentPage = pagesList[i];

      // Skip locked pages - they should not be moved
      if (
        currentPage?.m_folderID &&
        isLockedPage(album, currentPage.m_folderID)
      ) {
        continue;
      }

      const prevPage = handleSwapItem({
        pagesList,
        pageIndex: i,
        previousPageContents,
        previousPageLayoutId,
      });
      if (prevPage) {
        previousPageContents = prevPage.previousPageContents;
        previousPageLayoutId = prevPage.previousPageLayoutId;
      }
    }
    pagesList[0].m_child_folders = activePageContents;
    pagesList[0].m_layoutID = activePageLayoutId;
  }
}

/**
 * Handles the movement of pages in a regular (non-layflat) photo album
 * This function manages the complex logic of moving pages between spreads while maintaining
 * the album's structure and handling both forward and backward movements
 *
 * @param currentSpread - The spread containing the page to be moved
 * @param destinationSpread - The target spread for the page
 * @param activePageId - ID of the page being moved
 * @param destinationPageId - ID of the target page
 * @param spreadFolders - Array of all spread folders in the album
 * @param currentSpreadIndex - Index of the current spread
 * @param destinationSpreadIndex - Index of the destination spread
 * @param album - The photo album to check for locked pages
 *
 * @example
 * // Move a page forward in the album
 * handleRegularBookPageMove({
 *   currentSpread: spread1,
 *   destinationSpread: spread2,
 *   activePageId: 1,
 *   destinationPageId: 2,
 *   spreadFolders: [spread1, spread2, spread3],
 *   currentSpreadIndex: 0,
 *   destinationSpreadIndex: 1,
 *   album: photoAlbum
 * });
 */
interface HandleRegularBookPageMoveProps {
  currentSpread: Folder;
  destinationSpread: Folder;
  activePageId: number;
  destinationPageId: number;
  spreadFolders: Folder[];
  currentSpreadIndex: number;
  destinationSpreadIndex: number;
  album: PhotoAlbum;
}

function handleRegularBookPageMove({
  currentSpread,
  destinationSpread,
  activePageId,
  destinationPageId,
  spreadFolders,
  currentSpreadIndex,
  destinationSpreadIndex,
  album,
}: HandleRegularBookPageMoveProps) {
  const pagesList: Folder[] = [];
  const activePageIndex = currentSpread?.m_child_folders?.findIndex(
    (folder) => folder?.m_folderID === activePageId
  );
  const destinationPageIndex = destinationSpread?.m_child_folders?.findIndex(
    (folder) => folder?.m_folderID === destinationPageId
  );

  const isBackward = currentSpreadIndex >= destinationSpreadIndex;
  const startIndex = isBackward ? destinationSpreadIndex : currentSpreadIndex;
  const endIndex = isBackward ? currentSpreadIndex : destinationSpreadIndex;

  for (let i = startIndex; i <= endIndex; i++) {
    spreadFolders[i]?.m_child_folders?.forEach((folder) => {
      if (folder) {
        pagesList.push(folder);
      }
    });
  }

  if (!currentSpread?.m_child_folders || !destinationSpread?.m_child_folders) {
    return;
  }

  if (isBackward) {
    if (currentSpreadIndex !== destinationSpreadIndex) {
      trimPagesList({
        pagesList,
        destinationSpread: currentSpread,
        currentSpread: destinationSpread,
        activePageIndex: destinationPageIndex ?? 0,
        destinationPageIndex: activePageIndex ?? 0,
      });
    }
    circularSwap({
      pagesList,
      activePageId,
      destinationPageId,
      currentSpread,
      destinationSpread,
      album,
    });
  } else {
    trimPagesList({
      pagesList,
      destinationSpread,
      currentSpread,
      activePageIndex: activePageIndex ?? 0,
      destinationPageIndex: destinationPageIndex ?? 0,
    });
    circularSwap({
      pagesList,
      activePageId,
      destinationPageId,
      currentSpread,
      destinationSpread,
      album,
      backward: true,
    });
  }
}

/**
 * Trims the pages list based on the current and destination spreads
 * This function removes unnecessary pages from the list to ensure proper page swapping
 *
 * @param pagesList - The list of pages to be trimmed
 * @param destinationSpread - The target spread for the page
 * @param activePageIndex - Index of the active page in its spread
 * @param destinationPageIndex - Index of the destination page in its spread
 * @param currentSpread - The spread containing the active page
 *
 * @example
 * // Trim pages list for a forward move
 * trimPagesList({
 *   pagesList: [page1, page2, page3],
 *   destinationSpread: spread2,
 *   activePageIndex: 0,
 *   destinationPageIndex: 1,
 *   currentSpread: spread1
 * });
 */
function trimPagesList({
  pagesList,
  destinationSpread,
  activePageIndex,
  destinationPageIndex,
  currentSpread,
}: {
  pagesList: Folder[];
  destinationSpread: Folder;
  activePageIndex: number;
  destinationPageIndex: number;
  currentSpread: Folder;
}) {
  if (activePageIndex === 1 && currentSpread?.m_child_folders?.[0]) {
    pagesList.shift();
  }
  if (
    destinationPageIndex === 0 &&
    destinationSpread?.m_child_folders?.length &&
    destinationSpread?.m_child_folders[1]
  ) {
    pagesList.pop();
  }
}

/**
 * Handles the movement of pages in a layflat photo album
 * This function manages the simpler logic of moving entire spreads in a layflat album
 *
 * @param spreadFolders - Array of all spread folders in the album
 * @param currentSpreadIndex - Index of the spread to be moved
 * @param destinationSpreadIndex - Target index for the spread
 *
 * @example
 * // Move a spread in a layflat album
 * handleLayflatBookPageMove({
 *   spreadFolders: [spread1, spread2, spread3],
 *   currentSpreadIndex: 0,
 *   destinationSpreadIndex: 2
 * });
 */
interface HandleLayflatBookPageMoveProps {
  spreadFolders: Folder[];
  currentSpreadIndex: number;
  destinationSpreadIndex: number;
}

function handleLayflatBookPageMove({
  spreadFolders,
  currentSpreadIndex,
  destinationSpreadIndex,
}: HandleLayflatBookPageMoveProps) {
  const [movedSpread] = spreadFolders.splice(currentSpreadIndex, 1);
  spreadFolders.splice(destinationSpreadIndex, 0, movedSpread);
}

/**
 * Handles the swapping of individual items within pages
 * This function manages the exchange of contents and layout IDs between pages
 *
 * @param pagesList - List of pages containing the items to be swapped
 * @param pageIndex - Index of the page to be modified
 * @param previousPageContents - Contents to be placed in the page
 * @param previousPageLayoutId - Layout ID to be assigned to the page
 *
 * @returns Object containing the previous page contents and layout ID, or null if the page doesn't exist
 *
 * @example
 * // Swap contents between two pages
 * const result = handleSwapItem({
 *   pagesList: [page1, page2],
 *   pageIndex: 0,
 *   previousPageContents: page2Contents,
 *   previousPageLayoutId: page2LayoutId
 * });
 */
interface HandleSwapItemProps {
  pagesList: Folder[];
  pageIndex: number;
  previousPageContents: (Folder | null)[] | null;
  previousPageLayoutId: number;
}

function handleSwapItem({
  pagesList,
  pageIndex,
  previousPageContents,
  previousPageLayoutId,
}: HandleSwapItemProps) {
  if (!pagesList[pageIndex]) {
    return null;
  }
  const currentPageContents = structuredClone(
    pagesList[pageIndex].m_child_folders
  );
  const currentPageLayoutId = pagesList[pageIndex].m_layoutID;

  pagesList[pageIndex].m_child_folders = previousPageContents;

  // Validate the layout ID against the layout store
  const imageCount =
    previousPageContents?.filter(
      (item) => item && item.m_type !== folderMtypeEnum.TEXT_TYPE
    ).length || 1;
  pagesList[pageIndex].m_layoutID = validateLayoutId(
    previousPageLayoutId,
    imageCount
  );

  return {
    previousPageContents: currentPageContents,
    previousPageLayoutId: currentPageLayoutId,
  };
}
