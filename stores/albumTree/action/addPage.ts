import { PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { isLayflatAlbum } from '@/lib/utils/albumUtils';
import {
  createFolderCopy,
  getRandomInsertionIndex,
  isValidAlbumForAddingPage,
} from '@/lib/TreeV5/utils/album';
import { trackError } from '@/utils/datadogErrorTracking';

export type InsertPosition = 'first' | 'last' | 'before' | 'after';

export interface AddPageOptions {
  position: InsertPosition;
  currentPageIndex?: number;
}

const calculateInsertionIndex = (
  spreadFolderCount: number,
  options: AddPageOptions
): number => {
  const { position, currentPageIndex } = options;

  switch (position) {
    case 'first':
      return 1;

    case 'last':
      return spreadFolderCount - 1;

    case 'before':
      if (currentPageIndex === undefined || currentPageIndex < 1) {
        return 1;
      }
      return currentPageIndex;

    case 'after':
      if (currentPageIndex === undefined || currentPageIndex < 0) {
        return 1;
      }
      return Math.min(currentPageIndex + 1, spreadFolderCount - 1);

    default:
      return 1;
  }
};

export const addPage = (
  album: PhotoAlbum,
  options: AddPageOptions = { position: 'first' }
): { album: PhotoAlbum; insertionIndex: number } => {
  if (!isValidAlbumForAddingPage(album)) {
    return { album, insertionIndex: -1 };
  }

  const albumCopy = structuredClone(album);
  const nextFolderId = albumCopy.m_treeV5.m_book_subtree.m_next_folderID || 1;
  const spreadFolders = albumCopy.m_treeV5.m_book_subtree.m_spread_folders;

  const insertionIndex = calculateInsertionIndex(
    spreadFolders.length,
    options
  );

  const randomIndex = getRandomInsertionIndex(spreadFolders.length);
  const randomFolder = spreadFolders[randomIndex];
  const isLayflat = isLayflatAlbum(albumCopy);
  const { folderCopy, updatedNextFolderId } = createFolderCopy(
    randomFolder,
    nextFolderId,
    isLayflat
  );

  albumCopy.m_treeV5.m_book_subtree.m_next_folderID = updatedNextFolderId;
  albumCopy.m_treeV5.m_book_subtree.m_spread_folders.splice(
    insertionIndex,
    0,
    folderCopy
  );

  return { album: albumCopy, insertionIndex };
};

export const getAddPage: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['addPage']
> = (set, get) => (options?: AddPageOptions) => {
  try {
    const currentAlbum = get().album;

    if (!currentAlbum) return;

    // If no options provided, default to 'first' position
    const finalOptions: AddPageOptions = options || {
      position: 'first',
    };

    // If using 'before' or 'after', ensure we have currentPageIndex
    if (
      (finalOptions.position === 'before' || finalOptions.position === 'after') &&
      finalOptions.currentPageIndex === undefined
    ) {
      finalOptions.currentPageIndex = get().currentPageIndex;
    }

    const { album: updatedAlbum, insertionIndex } = addPage(
      currentAlbum,
      finalOptions
    );

    const currentPageIndex = get().currentPageIndex;
    const nextCurrentPageIndex =
      insertionIndex > -1 && insertionIndex <= currentPageIndex
        ? currentPageIndex + 1
        : currentPageIndex;
    const scrollToPageIndex =
      insertionIndex > -1 ? insertionIndex : undefined;

    set({
      album: updatedAlbum,
      currentPageIndex: nextCurrentPageIndex,
      scrollToPageIndex,
    });

    get().trackEmptyContainers();
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'addPage',
      albumToken: get().album?.m_treeV5?.m_album_token,
      currentPageCount:
        get().album?.m_treeV5?.m_book_subtree?.m_spread_folders?.length,
    });
    throw error;
  }
};
