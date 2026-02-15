import { Folder, PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { updateImagesLayout } from '@/lib/TreeV5/utils/layouts';
import { findFolderByPageId } from '@/lib/TreeV5/utils/album';
import useLayoutTreeStore from '@/stores/layout';
import { StoreWithTemporal } from '../useTemporalStore';
import { isCurrentFolderLayflat } from '@/lib/utils/albumUtils';
import { useAlbumTreeCovers } from '@/stores/cover';
import { useTourStore } from '@/stores/tour/tourStore';
import { folderMtypeEnum } from '@/utils/appConst';
import { trackError } from '@/utils/datadogErrorTracking';
import { findSpreadIndexByPageId } from './emptyContainerTracking';
export const removeImageFromFolder = (
  destPageIdElement: Folder | null | undefined,
  imageIds: number[],
  updatedAlbum: PhotoAlbum,
  isRemoveFolder: boolean = true,
  isRemoveImageFromTreeImages: boolean = true
) => {
  if (destPageIdElement?.m_child_folders) {
    const removedFolder: Folder[] = [];
    for (let i = destPageIdElement.m_child_folders.length - 1; i >= 0; i--) {
      const folder = destPageIdElement.m_child_folders[i];
      if (folder && imageIds.includes(folder.m_folderID)) {
        if (isRemoveFolder) {
          removedFolder.unshift(
            ...(destPageIdElement.m_child_folders.splice(i, 1) as Folder[])
          );
        } else {
          folder.m_folderID = 0;

          // Convert IMAGE_TYPE to EMPTY_CONTAINER when removing image and keeping container (last image removed)
          const remainingImagesCount =
            destPageIdElement.m_child_folders.filter(
              (child) => child && child.m_type === folderMtypeEnum.IMAGE_TYPE
            ).length - 1; // -1 because we're about to remove one

          if (
            remainingImagesCount === 0 &&
            folder.m_type === folderMtypeEnum.IMAGE_TYPE
          ) {
            folder.m_type = folderMtypeEnum.EMPTY_CONTAINER;
          }
        }
      }
    }
    if (isRemoveImageFromTreeImages) {
      updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages =
        updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages.filter(
          (image) => !imageIds.includes(image.m_folderID)
        );
    }
  }
  return updatedAlbum;
};

const removeImagesFromTree = (
  album: PhotoAlbum,
  currLayoutId: number,
  pageId: number,
  imageIds: number[],
  isRemoveImageFromTreeImages: boolean = true
): PhotoAlbum => {
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) {
    return album;
  }

  // Determine if this specific page is layflat instead of using the passed parameter
  const pageIsLayflat = isCurrentFolderLayflat(album, pageId);

  const {
    getLayflatLayoutById,
    getSpeardLayoutById,
    getRandomFromGroupByLayflatCount,
    getRandomFromGroupBySpreadCount,
  } = useLayoutTreeStore.getState();
  let updatedAlbum: PhotoAlbum = structuredClone(album);
  const { m_spread_folders: spreadFolders } =
    updatedAlbum.m_treeV5.m_book_subtree;
  const destPageIdElements = findFolderByPageId(spreadFolders, pageId);

  if (!destPageIdElements) {
    const coverFolders = updatedAlbum.m_treeV5.m_cover_subtree.m_spread_folders;
    const coverFolder = findFolderByPageId(coverFolders, pageId);
    const coverImageFolder = coverFolder?.m_child_folders?.find(
      (item) => item?.m_folderID === imageIds[0]
    );
    if (coverImageFolder) {
      coverImageFolder.m_folderID = 0;
    }

    useAlbumTreeCovers.getState().setNeedUpdate(true);
    return updatedAlbum;
  }

  const currLayout = pageIsLayflat
    ? getLayflatLayoutById(currLayoutId)
    : getSpeardLayoutById(currLayoutId);

  const destCountImages = currLayout?.m_count ? currLayout?.m_count - 1 : 1;

  const destLayout = pageIsLayflat
    ? getRandomFromGroupByLayflatCount(
        destCountImages > 0 ? destCountImages : 1
      )
    : getRandomFromGroupBySpreadCount(
        destCountImages > 0 ? destCountImages : 1
      );

  destPageIdElements.m_layoutID = destLayout.m_ID;

  if (currLayout.m_count === destLayout.m_count) {
    updatedAlbum = removeImageFromFolder(
      destPageIdElements,
      imageIds,
      updatedAlbum,
      false,
      isRemoveImageFromTreeImages
    );
    updateImagesLayout(
      destPageIdElements,
      destLayout,
      updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages
    );
  }

  if (currLayout.m_count > destLayout.m_count) {
    updatedAlbum = removeImageFromFolder(
      destPageIdElements,
      imageIds,
      updatedAlbum,
      true,
      isRemoveImageFromTreeImages
    );

    updateImagesLayout(
      destPageIdElements,
      destLayout,
      updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages
    );
  }

  //catch invalid situation - if we remove image the destination can't be greater than current
  if (currLayout.m_count < destLayout.m_count) {
    const error = new Error(
      'Something went wrong with removing images, the new count cannot be bigger than the old.'
    );
    trackError(error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'removeImagesFromTree',
      pageId,
      currLayoutId: currLayout.m_ID,
      currLayoutCount: currLayout.m_count,
      destLayoutId: destLayout.m_ID,
      destLayoutCount: destLayout.m_count,
      imageIds: imageIds.join(','),
    });
    throw error;
  }

  return updatedAlbum;
};

export const getRemoveImagesFromTreeAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['removeImagesFromTree']
> =
  (set, get, store: StoreWithTemporal) =>
  (
    currLayoutId: number,
    pageId: number,
    imageIds: number[],
    isRemoveImageFromTreeImages?: boolean
  ) => {
    const album = get().album;
    if (!album) {
      return;
    }

    const updatedAlbum = removeImagesFromTree(
      album,
      currLayoutId,
      pageId,
      imageIds,
      isRemoveImageFromTreeImages
    );

    // Disable temporal store clear for now
    const clear = store.temporal?.getState?.().clear;
    clear?.();

    set({ album: updatedAlbum });

    // Incremental tracking: Only track the specific spread where image was removed
    if (updatedAlbum.m_treeV5?.m_book_subtree?.m_spread_folders) {
      const spreadIndex = findSpreadIndexByPageId(
        updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
        pageId
      );
      if (spreadIndex !== -1) {
        get().trackSpreadEmptyContainers(spreadIndex);
      }
    }

    // after removing images, trigger images tour
    useTourStore.getState().startImagesTour();
  };
