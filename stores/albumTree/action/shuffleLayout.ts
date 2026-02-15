import { PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { findFolderByPageId } from '@/lib/TreeV5/utils/album';
import useLayoutTreeStore from '@/stores/layout';
import { updateImagesLayout } from '@/lib/TreeV5/utils/layouts';
import { trackError } from '@/utils/datadogErrorTracking';
import { findSpreadIndexByPageId } from './emptyContainerTracking';

const shuffleLayout = (
  album: PhotoAlbum,
  layoutId: number,
  pageId: number,
  isLayflat: boolean
): PhotoAlbum => {
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) {
    console.warn('Album structure is invalid or missing spread folders');
    return album;
  }
  const updatedAlbum: PhotoAlbum = structuredClone(album);

  const { m_spread_folders: spreadFolders } =
    updatedAlbum.m_treeV5.m_book_subtree;

  const destPageIdElements = findFolderByPageId(spreadFolders, pageId);
  if (!destPageIdElements) {
    console.warn(`Folder not found for page ID: ${pageId}`);
    return album;
  }

  if (!destPageIdElements || !destPageIdElements.m_child_folders) {
    console.warn(`No valid page elements found for page ID: ${pageId}`);
    return album;
  }

  const layoutStore = useLayoutTreeStore.getState();
  const originaLayout = isLayflat
    ? layoutStore.getLayflatLayoutById(layoutId)
    : layoutStore.getSpeardLayoutById(layoutId);

  if (!originaLayout) {
    console.warn(`Layout not found for ID: ${layoutId}`);
    return album;
  }

  let newRandomLayout;
  let attempts = 0;
  const maxAttempts = 10;
  while (attempts < maxAttempts) {
    newRandomLayout = isLayflat
      ? layoutStore.getRandomFromGroupByLayflatCount(
          originaLayout.m_count,
          layoutId
        )
      : layoutStore.getRandomFromGroupBySpreadCount(
          originaLayout.m_count,
          layoutId
        );
    if (!newRandomLayout) {
      break;
    }

    if (newRandomLayout.m_ID !== originaLayout.m_ID) {
      break;
    }

    attempts++;
  }

  if (!newRandomLayout) {
    return album;
  }

  if (!destPageIdElements.m_child_folders) return album;

  updateImagesLayout(
    destPageIdElements,
    newRandomLayout,
    updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages
  );
  return updatedAlbum;
};

export const getShuffleLayoutAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['shuffleLayout']
> = (set, get) => (layoutId: number, pageId: number, isLayflat: boolean) => {
  try {
    const album = get().album;
    if (!album) {
      return;
    }
    const updatedAlbum = shuffleLayout(album, layoutId, pageId, isLayflat);
    set({ album: updatedAlbum });

    // Incremental tracking: Only track the specific spread where layout was shuffled
    if (updatedAlbum.m_treeV5?.m_book_subtree?.m_spread_folders) {
      const spreadIndex = findSpreadIndexByPageId(
        updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
        pageId
      );
      if (spreadIndex !== -1) {
        get().trackSpreadEmptyContainers(spreadIndex);
      }
    }
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'shuffleLayout',
      layoutId,
      pageId,
      isLayflat,
    });
  }
};
