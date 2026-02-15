import { Folder, PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { findFolderByPageId, swapElements } from '@/lib/TreeV5/utils/album';
import {
  filterFoldersByType,
  updateImagesLayout,
} from '@/lib/TreeV5/utils/layouts';
import {
  handleCoverImageSwap,
  updateCoverImagesCropAndOrientation,
} from '@/lib/TreeV5/utils/covers';
import { DragEndEvent } from '@dnd-kit/core';
import {
  findImageByFolderId,
  isLayflatFolder,
  updateImageToFitContainer,
  removeEmptyContainers,
  getLayoutById,
} from '@/lib/utils/albumUtils';
import { useAlbumTreeCovers } from '@/stores/cover';
import { folderMtypeEnum } from '@/utils/appConst';
import { trackError } from '@/utils/datadogErrorTracking';
import { findSpreadIndexByPageId } from './emptyContainerTracking';
import { applyTextBoxProperties, applyFolderFrameProperties } from '@/lib/TreeV5/utils/text';

const moveToEmptyContainer = (
  album: PhotoAlbum,
  curChildFolders: Folder,
  destChildFolders: Folder,
  currentPageId: string | number,
  isLayflat: boolean,
  destPageFolder: Folder
): PhotoAlbum => {
  const sourceFolderId = curChildFolders.m_folderID;
  const sourceContainerLayoutId = curChildFolders.m_layoutID;

  destChildFolders.m_folderID = sourceFolderId;
  destChildFolders.m_type = folderMtypeEnum.IMAGE_TYPE;
  curChildFolders.m_folderID = 0;
  curChildFolders.m_type = folderMtypeEnum.EMPTY_CONTAINER;

  const spreadFolders = album.m_treeV5?.m_book_subtree?.m_spread_folders;
  if (!spreadFolders) return album;

  const sourcePageFolder = findFolderByPageId(
    spreadFolders,
    Number(currentPageId)
  );
  if (!sourcePageFolder) return album;

  removeEmptyContainers(sourcePageFolder, sourceContainerLayoutId, isLayflat);

  const movedImage = findImageByFolderId(album, sourceFolderId);
  if (movedImage) {
    updateImageToFitContainer(movedImage, destChildFolders);
  }
  applyTextBoxProperties(destPageFolder, sourceFolderId);
  applyFolderFrameProperties(destPageFolder, sourceFolderId);

  const imagesToUpdate = album.m_treeV5?.m_book_subtree?.m_tree_tmages;
  if (imagesToUpdate && sourcePageFolder) {
    const currentLayout = sourcePageFolder.m_layoutID;
    const layout = getLayoutById(currentLayout);
    if (layout) {
      updateImagesLayout(sourcePageFolder, layout, imagesToUpdate);
    }
  }

  return album;
};

const swapFilledContainers = (
  album: PhotoAlbum,
  curChildFolders: Folder[],
  destChildFolders: Folder[],
  curImageIndex: number,
  destImageIndex: number,
  curPageFolder: Folder,
  destPageFolder: Folder
): PhotoAlbum => {
  swapElements(
    curChildFolders,
    curImageIndex,
    destChildFolders,
    destImageIndex
  );

  const firstImage = findImageByFolderId(
    album,
    destChildFolders[destImageIndex].m_folderID
  );
  updateImageToFitContainer(firstImage, destChildFolders[destImageIndex]);
  applyTextBoxProperties(destPageFolder, destChildFolders[destImageIndex].m_folderID);
  applyFolderFrameProperties(destPageFolder, destChildFolders[destImageIndex].m_folderID);

  const secondImage = findImageByFolderId(
    album,
    curChildFolders[curImageIndex].m_folderID
  );
  updateImageToFitContainer(secondImage, curChildFolders[curImageIndex]);
  applyTextBoxProperties(curPageFolder, curChildFolders[curImageIndex].m_folderID);
  applyFolderFrameProperties(curPageFolder, curChildFolders[curImageIndex].m_folderID);

  return album;
};

const prepareDragContext = (e: DragEndEvent, album: PhotoAlbum) => {
  const currentImageId = e.active.data.current?.id;
  const destImageId = e.over?.data.current?.id;
  const currentPageId = e.active.data.current?.pageId;
  const destPageId = e.over?.data.current?.pageId;
  const currentContainerId = e.active.data.current?.containerId;
  const destContainerId = e.over?.data.current?.containerId;

  if ((!currentImageId && !destImageId) || !currentPageId || !destPageId) {
    return null;
  }

  const isEmptyDestination =
    !destImageId ||
    destImageId === 0 ||
    findImageByFolderId(album, destImageId) === undefined;
  const spreadFolders = album.m_treeV5?.m_book_subtree.m_spread_folders;

  if (!spreadFolders) return null;

  const curPageFolder = findFolderByPageId(spreadFolders, currentPageId);
  const destPageFolder = findFolderByPageId(spreadFolders, destPageId);

  const isLayflat = curPageFolder ? isLayflatFolder(curPageFolder) : false;

  if (!curPageFolder?.m_child_folders || !destPageFolder?.m_child_folders) {
    return null;
  }

  const curContainer = curPageFolder.m_child_folders.find(
    (folder): folder is Folder =>
      folder !== null && folder.m_layoutID === currentContainerId
  );
  const destContainer = destPageFolder.m_child_folders.find(
    (folder): folder is Folder =>
      folder !== null && folder.m_layoutID === destContainerId
  );

  if (!curContainer || !destContainer) {
    return null;
  }

  const curContainers = curPageFolder.m_child_folders.filter(
    (folder): folder is Folder => folder !== null
  );
  const destContainers = destPageFolder.m_child_folders.filter(
    (folder): folder is Folder => folder !== null
  );

  const curContainerIndex = curContainers.findIndex(
    (item) => item.m_layoutID === currentContainerId
  );
  const destContainerIndex = destContainers.findIndex(
    (item) => item.m_layoutID === destContainerId
  );

  return {
    currentImageId,
    destImageId,
    currentPageId,
    destPageId,
    isEmptyDestination,
    curContainer,
    destContainer,
    curContainers,
    destContainers,
    curContainerIndex,
    destContainerIndex,
    isLayflat,
    curPageFolder,
    destPageFolder,
  };
};

const swapImages = (
  e: DragEndEvent,
  album: PhotoAlbum | null
): PhotoAlbum | null => {
  if (!album) return album;

  let updatedAlbum: PhotoAlbum = structuredClone(album);
  if (e.active.data.current?.isCover) {
    const spreadFoldersCover =
      updatedAlbum.m_treeV5?.m_cover_subtree.m_spread_folders[0];
    const imageTypeFolders = filterFoldersByType(
      spreadFoldersCover,
      folderMtypeEnum.IMAGE_TYPE
    );

    updatedAlbum = handleCoverImageSwap(
      imageTypeFolders,
      e.active.data.current?.id,
      e.over?.data.current?.id,
      updatedAlbum
    );

    updateCoverImagesCropAndOrientation(
      updatedAlbum,
      imageTypeFolders,
      e.active.data.current?.id,
      e.over?.data.current?.id
    );
    useAlbumTreeCovers.getState().setNeedUpdate(true);

    return updatedAlbum;
  }

  const context = prepareDragContext(e, updatedAlbum);
  if (!context) return album;

  const {
    isEmptyDestination,
    curContainer,
    destContainer,
    curContainers,
    destContainers,
    curContainerIndex,
    destContainerIndex,
    currentPageId,
    isLayflat,
    curPageFolder,
    destPageFolder,
  } = context;

  // If currentpage has more than one image(container) and we move it to an empty container
  // then move the image and remove the empty container else swap images
  if (
    isEmptyDestination &&
    curPageFolder != destPageFolder
  ) {
    return moveToEmptyContainer(
      updatedAlbum,
      curContainer,
      destContainer,
      currentPageId,
      isLayflat,
      destPageFolder
    );
  } else {
    return swapFilledContainers(
      updatedAlbum,
      curContainers,
      destContainers,
      curContainerIndex,
      destContainerIndex,
      curPageFolder,
      destPageFolder
    );
  }
};

export const getSwapImagesAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['swapImages']
> = (set, get) => (e: DragEndEvent) => {
  try {
    const album = get().album;
    const updatedAlbum = swapImages(e, album);

    if (updatedAlbum) {
      set({ album: updatedAlbum });

      const activePageId = e.active.data.current?.pageId;
      const destPageId = e.over?.data.current?.pageId;

      if (updatedAlbum.m_treeV5?.m_book_subtree?.m_spread_folders) {
        const spreadIndexes = new Set<number>();

        if (activePageId) {
          const activeSpreadIndex = findSpreadIndexByPageId(
            updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
            activePageId
          );
          if (activeSpreadIndex !== -1) spreadIndexes.add(activeSpreadIndex);
        }

        if (destPageId) {
          const destSpreadIndex = findSpreadIndexByPageId(
            updatedAlbum.m_treeV5.m_book_subtree.m_spread_folders,
            destPageId
          );
          if (destSpreadIndex !== -1) spreadIndexes.add(destSpreadIndex);
        }

        spreadIndexes.forEach((index) =>
          get().trackSpreadEmptyContainers(index)
        );
      }
    }
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'swapImages',
      activeImageId: e.active.data.current?.id,
      destImageId: e.over?.data.current?.id,
      activePageId: e.active.data.current?.pageId,
      destPageId: e.over?.data.current?.pageId,
      isCover: e.active.data.current?.isCover,
    });
  }
};
