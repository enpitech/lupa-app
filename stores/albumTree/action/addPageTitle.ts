import { PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { createBackgroundFromBg } from '@/utils/editor/backgroundUtils';
import { findAndPrepareTargetPage } from '@/lib/TreeV5/utils/layouts';
import { findFolderByPageId } from '@/lib/TreeV5/utils/album';
import {
  addTitleFolderToPage,
  addTitleText,
  createTitleFolder,
  getPageTitleResources,
} from '@/lib/TreeV5/utils/text';
import { isLayflatFolder } from '@/lib/utils/albumUtils';
import { trackError } from '@/utils/datadogErrorTracking';

function addPageTitle(
  album: PhotoAlbum,
  pageId: number,
  title: string
): PhotoAlbum {
  if (!album) return album;
  const updatedAlbum: PhotoAlbum = structuredClone(album);

  // Use the global method to find the target folder
  const targetFolder = findFolderByPageId(
    updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
    pageId
  );

  // Use folder-specific layflat detection instead of global parameter
  const isLayflat: boolean = targetFolder
    ? isLayflatFolder(targetFolder)
    : false;

  const targetPageIdElements = findAndPrepareTargetPage(updatedAlbum, pageId);

  if (!targetPageIdElements) {
    return album;
  }

  const {
    nextFolderId,
    pageTextFrame,
    bgTextFrame,
    textContainers,
    truncatedTitle,
    albumResources,
  } = getPageTitleResources(
    updatedAlbum,
    isLayflat,
    title,
    targetPageIdElements.m_background?.m_unique_id ?? 0
  );

  const titleFolder = createTitleFolder(
    targetPageIdElements,
    pageTextFrame,
    textContainers,
    nextFolderId
  );
  addTitleFolderToPage(targetPageIdElements, titleFolder);
  targetPageIdElements.m_background = createBackgroundFromBg(bgTextFrame);

  addTitleText(
    updatedAlbum.m_treeV5.m_book_subtree.m_tree_texts,
    nextFolderId,
    truncatedTitle,
    albumResources
  );

  return updatedAlbum;
}

export const getAddPageTitleAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['addPageTitle']
> = (set, get) => (pageId: number, title: string) => {
  try {
    const album = get().album;
    if (!album) return;

    const updatedAlbum = addPageTitle(album, pageId, title);
    set({ album: updatedAlbum });
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'addPageTitle',
      pageId,
      title,
      albumToken: get().album?.m_treeV5?.m_album_token,
    });
  }
};
