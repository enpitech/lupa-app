import { Folder, Image, PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';

import {
  extractPageElements,
  findFolderParentSpreadByPageId,
} from '@/lib/TreeV5/utils/album';
import { DragEndEvent } from '@dnd-kit/core';
import { addImageToCoverPage } from '@/lib/TreeV5/utils/covers';
import { removeImageFromFolder } from './removeImagesFromTree';
import { DROP_BUTTON_ID } from '@/utils/editor/constants';
import { updateImageToFitContainer } from '@/lib/utils/albumUtils';
import { folderMtypeEnum } from '@/utils/appConst';
import { trackError } from '@/utils/datadogErrorTracking';
import { findSpreadIndexByPageId } from './emptyContainerTracking';
import { applyFolderFrameProperties } from '@/lib/TreeV5/utils/text';

const addImageToPage = (
  e: DragEndEvent,
  album: PhotoAlbum | null
): PhotoAlbum | null => {
  if (!album) return album;

  const currentImage = e.active.data.current;
  const currentImageId = e.active.data.current?.id;

  const destPageId = e.over?.data.current?.pageId;
  if (!currentImageId || !destPageId) {
    return album;
  }

  let updatedAlbum: PhotoAlbum = structuredClone(album);
  const spreadFolders = updatedAlbum.m_treeV5?.m_book_subtree.m_spread_folders;

  if (!spreadFolders) {
    return album;
  }

  const destSpreadFolder = spreadFolders.find((spread) =>
    spread.m_child_folders?.some((page) => page?.m_folderID === destPageId)
  );

  let destFolder = destSpreadFolder;

  if (!destFolder) {
    const coverFolders = updatedAlbum.m_treeV5.m_cover_subtree.m_spread_folders;
    const coverFolder = findFolderParentSpreadByPageId(
      coverFolders,
      destPageId
    );
    if (!coverFolder) {
      return album;
    }
    const targetCoverSlot = coverFolder?.m_child_folders?.find(
      (item) => item?.m_folderID === e.over?.data.current?.id
    );
    if (targetCoverSlot) {
      targetCoverSlot.m_folderID =
        updatedAlbum.m_treeV5.m_cover_subtree.m_next_folderID;
    }
    if (!targetCoverSlot) {
      return album;
    }
    return addImageToCoverPage(
      updatedAlbum,
      currentImageId,
      e,
      targetCoverSlot
    );
  }

  let destPageIdElements = extractPageElements(destFolder).filter(
    (item): item is Folder => item !== null
  );

  if (!destPageIdElements) {
    return album;
  }
  const destImageId = e.over?.data.current?.id;

  const albumTreeImages = updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages;

  // Check if dragging from existing image slot (has rotation data - only check m_orientation)
  const sourceImageData = currentImage?.imageFromTree?.[currentImageId];
  const hasSourceRotation =
    sourceImageData && sourceImageData.m_orientation !== 'JPEG_NORMAL';

  const newImage: Image = {
    m_unique_id: currentImageId,
    m_medium_width_px: currentImage?.imageMediumWidth,
    m_medium_height_px: currentImage?.imageMediumHeight,
    m_alignment: 0,
    m_orientation: hasSourceRotation
      ? sourceImageData.m_orientation
      : 'JPEG_NORMAL',
    m_faceRects: [],
    m_image_name: currentImage?.image_name,
    m_status: 'NORMAL_STAT',
    m_folderID: updatedAlbum.m_treeV5.m_book_subtree.m_next_folderID,
    m_crop_rect: { X: 0, Y: 0, Width: 1, Height: 1 },
    m_image_opacity: 1,
    m_isLocked: false,
    m_text: null,
  };

  let destPageFolder = destFolder.m_child_folders?.find(
    (item) => item?.m_folderID === destPageId
  );

  if (!destPageFolder) {
    return album;
  }

  //if on over image need to find the folder by id of the image not of the page
  if (e.over?.data.current?.type === 'image') {
    destPageFolder = destPageFolder.m_child_folders?.find(
      (item) => item?.m_folderID === destImageId
    );

    if (!destPageFolder) {
      return album;
    }
  }

  updateImageToFitContainer(newImage, destPageFolder);

  updatedAlbum.m_treeV5.m_book_subtree.m_next_folderID++;
  albumTreeImages.push(newImage);

  if (!e.over?.id.toString().includes(DROP_BUTTON_ID)) {
    if (destFolder.m_child_folders && destFolder.m_child_folders.length != 0) {
      const filteredFolders = destFolder.m_child_folders.filter(
        (item) => item && item.m_folderID == e.over?.data.current?.pageId
      );
      if (filteredFolders.length > 0 && filteredFolders[0]) {
        destFolder = filteredFolders[0];
      }
      destPageIdElements = destFolder.m_child_folders
        ? destFolder.m_child_folders.filter(
            (item): item is Folder => item !== null
          )
        : [];
    }

    if (e.over?.data.current?.id != 0) {
      updatedAlbum = removeImageFromFolder(
        destFolder,
        [e.over?.data.current?.id],
        updatedAlbum,
        false
      );
    }
    const targetSlot = destPageIdElements.filter(
      (item) => item.m_layoutID == e.over?.data.current?.layoutId
    );
    if (targetSlot[0]) {
      targetSlot[0].m_folderID = newImage.m_folderID;

      // Convert EMPTY_CONTAINER to IMAGE_TYPE when adding an image
      if (targetSlot[0].m_type === folderMtypeEnum.EMPTY_CONTAINER) {
        targetSlot[0].m_type = folderMtypeEnum.IMAGE_TYPE;
      }

      applyFolderFrameProperties(destFolder, newImage.m_folderID);
    }
  }

  return updatedAlbum;
};

export const getAddImageToPageAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['addImageToPage']
> = (set, get) => (e: DragEndEvent) => {
  try {
    const album = get().album;

    const updatedAlbum = addImageToPage(e, album);

    if (updatedAlbum) {
      set({ album: updatedAlbum });

      // Incremental tracking: Only track the specific spread that changed
      const destPageId = e.over?.data.current?.pageId;
      if (
        destPageId &&
        updatedAlbum.m_treeV5?.m_book_subtree?.m_spread_folders
      ) {
        const spreadIndex = findSpreadIndexByPageId(
          updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
          destPageId
        );
        if (spreadIndex !== -1) {
          get().trackSpreadEmptyContainers(spreadIndex);
        }
      }
    }
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'addImageToPage',
      currentImageId: e.active.data.current?.id,
      destPageId: e.over?.data.current?.pageId,
      destImageId: e.over?.data.current?.id,
      imageName: e.active.data.current?.image_name,
    });
  }
};
