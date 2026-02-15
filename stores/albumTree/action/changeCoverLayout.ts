import { Folder, Image, PhotoAlbum, Text } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { useAlbumTreeCovers } from '@/stores/cover';
import {
  filterFoldersByType,
  parseSizeLayout,
  updateImageCropAndOrientation,
} from '@/lib/TreeV5/utils/layouts';
import { folderMtypeEnum } from '@/utils/appConst';
import { trackError } from '@/utils/datadogErrorTracking';
const changeCoverLayout = (cover: Folder, album: PhotoAlbum): PhotoAlbum => {
  if (!album || !album.m_treeV5.m_cover_subtree.m_spread_folders) {
    return album;
  }
  const newAlbum: PhotoAlbum = structuredClone(album);

  // Get the current layout before changing to the new one
  const currentCoverFolder =
    newAlbum.m_treeV5.m_cover_subtree.m_spread_folders[0];
  const currentImageTypeFolders = filterFoldersByType(
    currentCoverFolder,
    folderMtypeEnum.IMAGE_TYPE
  );

  newAlbum.m_treeV5.m_cover_subtree.m_spread_folders[0] = cover;

  const newImageTypeFolders = filterFoldersByType(
    newAlbum.m_treeV5.m_cover_subtree.m_spread_folders[0],
    folderMtypeEnum.IMAGE_TYPE
  );
  const spineTypeFolders = filterFoldersByType(
    newAlbum.m_treeV5.m_cover_subtree.m_spread_folders[0],
    'SPINE_REGION_TYPE'
  );
  const textTypeFolders = filterFoldersByType(
    newAlbum.m_treeV5.m_cover_subtree.m_spread_folders[0],
    'TITLE_TYPE'
  );
  const textInSpineTypeFolders = filterFoldersByType(
    spineTypeFolders[0],
    'TITLE_TYPE'
  );

  // Handle images - migrate existing images to new positions
  migrateCoverImagesToNewLayout(
    currentImageTypeFolders,
    newImageTypeFolders,
    newAlbum.m_treeV5.m_cover_subtree.m_tree_tmages
  );

  // Handle texts
  newAlbum.m_treeV5.m_cover_subtree.m_tree_texts = [
    ...textTypeFolders,
    ...textInSpineTypeFolders,
  ]
    .map((folder) => {
      return useAlbumTreeCovers
        .getState()
        .texts.find((text) => text.m_folderID === folder.m_folderID);
    })
    .filter((text): text is Text => text !== undefined);

  useAlbumTreeCovers.getState().setNeedUpdate(true);
  return newAlbum;
};

export const migrateCoverImagesToNewLayout = (
  currentImageFolders: Folder[],
  newImageFolders: Folder[],
  coverImages: Image[]
): void => {
  // migrate existing images to new positions
  currentImageFolders.forEach((currentFolder, index) => {
    if (currentFolder.m_folderID === 0) return;

    const newFolder = newImageFolders[index];
    if (newFolder) {
      newFolder.m_folderID = currentFolder.m_folderID;

      const image = coverImages.find(
        (img) => img.m_folderID === currentFolder.m_folderID
      );
      if (image) {
        const dimensions = parseSizeLayout(newFolder.m_size);
        updateImageCropAndOrientation(
          image,
          dimensions.width,
          dimensions.height
        );
      }
    }
  });

  // find images that has no room in the layout
  if (newImageFolders.length < currentImageFolders.length) {
    const excessImageIds = currentImageFolders
      .slice(newImageFolders.length)
      .map((folder) => folder.m_folderID)
      .filter((id) => id !== 0);

    //set coverImages to the images left
    coverImages = coverImages.filter(
      (image) => !excessImageIds.includes(image.m_folderID)
    );
  }
};

export const getChangeCoverLayout: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['changeCoverLayout']
> = (set, get) => (cover: Folder) => {
  try {
    const album = get().album;
    if (!album) return;
    const updatedAlbum = changeCoverLayout(cover, album);

    set({ album: updatedAlbum });
    // Track empty containers after changing cover layout
    get().trackCoverEmptyContainers();
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'changeCoverLayout',
      coverLayoutId: cover.m_layoutID,
      coverFolderId: cover.m_folderID,
    });
  }
};
