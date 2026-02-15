import { Folder, PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { findFolderByPageId } from '@/lib/TreeV5/utils/album';
import useLayoutTreeStore from '@/stores/layout';
import {
  addMissingImageToPage,
  updateImagesLayout,
} from '@/lib/TreeV5/utils/layouts';
import {
  getDestinationFolder,
  applyTextBoxProperties,
} from '@/lib/TreeV5/utils/text';
import { folderMtypeEnum } from '@/utils/appConst';
import { updateImageToFitContainer } from '@/lib/utils/albumUtils';
import { trackError } from '@/utils/datadogErrorTracking';
import { findSpreadIndexByPageId } from './emptyContainerTracking';

export const getAlbumImageFrameColor = () => {
  const layoutStore = useLayoutTreeStore.getState();
  return layoutStore.getAlbumImageFrameColor();
};

// Function to apply text box properties to all images in a page
const applyTextBoxPropertiesToPage = (album: PhotoAlbum, pageId: number) => {
  try {
    const destinationFolder = getDestinationFolder(album, pageId);
    if (destinationFolder?.m_child_folders) {
      // Apply theme-based text box properties to all image folders on the page
      destinationFolder.m_child_folders.forEach((imageFolder) => {
        if (imageFolder && imageFolder.m_folderID) {
          applyTextBoxProperties(destinationFolder, imageFolder.m_folderID);
        }
      });
    }
  } catch (error) {
    trackError(
      error instanceof Error
        ? error
        : new Error('Failed to apply text box properties'),
      {
        errorType: 'store_error',
        store: 'albumTree',
        action: 'applyTextBoxPropertiesToPage',
        pageId,
      }
    );
  }
};

const changePageLayoutByLayoutId = (
  album: PhotoAlbum,
  currLayoutId: number,
  destLayoutId: number,
  pageId: number,
  imageId?: number
): PhotoAlbum => {
  try {
    if (currLayoutId === destLayoutId && !imageId) {
      return album;
    }
    if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) {
      return album;
    }

    // Determine if this specific page is layflat instead of using the passed parameter
    const updatedAlbum: PhotoAlbum = structuredClone(album);

    const { m_spread_folders: spreadFolders } =
      updatedAlbum.m_treeV5.m_book_subtree;
    const destPageIdElements = findFolderByPageId(spreadFolders, pageId);

    if (!destPageIdElements) {
      return album;
    }
    const imagesToUpdate =
      updatedAlbum?.m_treeV5?.m_book_subtree?.m_tree_tmages;

    // Handle case where we're adding an image to an empty slot in the same layout
    if (currLayoutId === destLayoutId && imageId) {
      const emptySlot = destPageIdElements.m_child_folders?.find(
        (folder) => folder && folder.m_folderID === 0
      );

      if (emptySlot) {
        emptySlot.m_folderID = imageId;
        // Change the type from EMPTY_CONTAINER to IMAGE_TYPE when an image is added to empty container
        emptySlot.m_type = folderMtypeEnum.IMAGE_TYPE;
        updateImageToFitContainer(
          imagesToUpdate?.find((img) => img.m_folderID === imageId),
          emptySlot
        );
        return updatedAlbum;
      }
    }

    const currLayout =
      useLayoutTreeStore.getState().getLayflatLayoutById(currLayoutId) ||
      useLayoutTreeStore.getState().getSpeardLayoutById(currLayoutId);

    const destLayout =
      useLayoutTreeStore.getState().getLayflatLayoutById(destLayoutId) ||
      useLayoutTreeStore.getState().getSpeardLayoutById(destLayoutId);

      destPageIdElements.m_layoutID = destLayoutId;


    if (currLayout.m_count === destLayout.m_count) {
      updateImagesLayout(destPageIdElements, destLayout, imagesToUpdate, false);
    }

    if (currLayout.m_count > destLayout.m_count) {
      if (destPageIdElements?.m_child_folders) {
        const foldersToRemoveCount = currLayout.m_count - destLayout.m_count;
        const tImages = new Set(
          updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages.map(
            (img) => img.m_folderID
          )
        );

        // Helper function to check if a folder is empty container
        const isFolderEmpty = (folder: Folder | null): boolean => {
          if (!folder) return true;
          return (
            (folder.m_type === folderMtypeEnum.IMAGE_TYPE ||
              folder.m_type === folderMtypeEnum.EMPTY_CONTAINER) &&
            !tImages.has(folder.m_folderID)
          );
        };

        // Separate folders into empty and non-empty
        const emptyFolders: (Folder | null)[] = [];
        const nonEmptyFolders: (Folder | null)[] = [];

        destPageIdElements.m_child_folders.forEach((folder) => {
          if (isFolderEmpty(folder)) {
            emptyFolders.push(folder);
          } else {
            nonEmptyFolders.push(folder);
          }
        });

        // Create list of folders to remove, prioritizing empty ones
        const foldersToRemove: (Folder | null)[] = [];

        // First, remove empty containers
        const emptyToRemove = Math.min(
          emptyFolders.length,
          foldersToRemoveCount
        );
        foldersToRemove.push(...emptyFolders.slice(0, emptyToRemove));

        // Then, remove non-empty containers if needed
        const remainingToRemove = foldersToRemoveCount - emptyToRemove;
        if (remainingToRemove > 0) {
          foldersToRemove.push(...nonEmptyFolders.slice(0, remainingToRemove));
        }

        // Remove the selected folders from the child_folders array
        destPageIdElements.m_child_folders =
          destPageIdElements.m_child_folders.filter(
            (folder) => !foldersToRemove.includes(folder)
          );

        // Clean up images that were in the removed folders
        updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages =
          updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages.filter(
            (image) =>
              !foldersToRemove.find(
                (folder) => folder && folder.m_folderID === image.m_folderID
              )
          );
      }
      updateImagesLayout(destPageIdElements, destLayout, imagesToUpdate, false);
    }
    if (currLayout.m_count < destLayout.m_count) {
      const imgFrameColor = getAlbumImageFrameColor();
      addMissingImageToPage(
        currLayout.m_count,
        destLayout.m_count,
        destLayout.m_containers,
        destPageIdElements,
        imageId,
        imgFrameColor,
        updatedAlbum
      );
      updateImagesLayout(destPageIdElements, destLayout, imagesToUpdate, false);
    }

    // Apply text box properties to ensure text colors are set correctly
    applyTextBoxPropertiesToPage(updatedAlbum, pageId);

    return updatedAlbum;
  } catch (error) {
    trackError(
      error instanceof Error
        ? error
        : new Error('Failed to change page layout'),
      {
        errorType: 'store_error',
        store: 'albumTree',
        action: 'changePageLayoutByLayoutId',
        currLayoutId,
        destLayoutId,
        pageId,
        imageId,
      }
    );
    return album;
  }
};

export const getChangePageLayoutByLayoutIdAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['changePageLayoutByLayoutId']
> =
  (set, get) =>
  (
    currLayoutId: number,
    destLayoutId: number,
    pageId: number,
    imageId?: number
  ) => {
    const album = get().album;
    if (!album) {
      return;
    }

    const updatedAlbum = changePageLayoutByLayoutId(
      album,
      currLayoutId,
      destLayoutId,
      pageId,
      imageId
    );

    set({ album: updatedAlbum });

    // Incremental tracking: Only track the specific spread where layout changed
    if (updatedAlbum.m_treeV5?.m_book_subtree?.m_spread_folders) {
      const spreadIndex = findSpreadIndexByPageId(
        updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
        pageId
      );
      if (spreadIndex !== -1) {
        get().trackSpreadEmptyContainers(spreadIndex);
      }
    }
  };
