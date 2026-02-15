import { Folder, Image, PhotoAlbum } from '@/types/tree';
import { swapElements } from './album';
import { DragEndEvent } from '@dnd-kit/core';
import useAlbumTreeStore from '@/stores/albumTree';
import { parseSizeLayout, updateImageCropAndOrientation } from './layouts';
import { updateImageToFitContainer } from '@/lib/utils/albumUtils';
import { useAlbumTreeCovers } from '@/stores/cover';

export const filterCoversByTheme = (
  album: PhotoAlbum,
  selectedColor?: string
) => {
  if (!album?.m_treeV5?.m_cover_subtree?.m_spread_folders) {
    return [];
  }

  const albumThemeName = album?.m_treeV5?.m_cover_theme;
  const covers = album?.m_treeV5?.m_cover_subtree?.m_spread_folders?.filter(
    (folder) => {
      // If selectedColor is provided, filter by color
      if (selectedColor) {
        const folderColor = folder?.m_background?.m_color_im_id;
        // For hex colors that start with #FF, compare after removing FF
        if (
          folderColor &&
          folderColor.startsWith('#FF') &&
          selectedColor.startsWith('#')
        ) {
          return folderColor.replace('#FF', '#') === selectedColor;
        }
        // Direct color comparison
        return folderColor === selectedColor;
      }
      // Default behavior: filter by theme name
      return folder?.m_background?.m_theme_name === albumThemeName;
    }
  );
  return covers || [];
};

export const filterCoversByLayoutId = (album: PhotoAlbum) => {
  if (!album?.m_treeV5?.m_cover_subtree?.m_spread_folders) {
    return [];
  }

  const albumTree = useAlbumTreeStore.getState().album;
  const layoutId =
    albumTree?.m_treeV5?.m_cover_subtree?.m_spread_folders?.[0]?.m_layoutID;
  const covers = album?.m_treeV5?.m_cover_subtree?.m_spread_folders?.filter(
    (folder) => {
      return folder?.m_layoutID === layoutId;
    }
  );
  return covers || [];
};

export const handleCoverImageSwap = (
  imageTypeFolders: Folder[],
  currentImageId: string,
  destImageId: string,
  updatedAlbum: PhotoAlbum
): PhotoAlbum => {
  const sourceIndex = imageTypeFolders.findIndex(
    (folder) => folder.m_folderID.toString() == currentImageId
  );
  const targetIndex = imageTypeFolders.findIndex(
    (folder) => folder.m_folderID.toString() == destImageId
  );

  swapElements(imageTypeFolders, sourceIndex, imageTypeFolders, targetIndex);

  return updatedAlbum;
};

export const addImageToCoverPage = (
  album: PhotoAlbum,
  currentImageId: number,
  e: DragEndEvent,
  targetCoverSlot: Folder,
): PhotoAlbum => {
  const currentImage = e.active.data.current;
  const destFolderId = album.m_treeV5.m_cover_subtree.m_next_folderID;
  const newImage: Image = {
    m_unique_id: currentImageId,
    m_medium_width_px: currentImage?.imageMediumWidth,
    m_medium_height_px: currentImage?.imageMediumHeight,
    m_alignment: 0,
    m_orientation: 'JPEG_NORMAL',
    m_faceRects: [],
    m_image_name: currentImage?.image_name,
    m_status: 'NORMAL_STAT',
    m_folderID: destFolderId,
    m_crop_rect: { X: 0, Y: 0, Width: 1, Height: 1 },
    m_image_opacity: 1,
    m_isLocked: false,
    m_text: null,
  };
  updateImageToFitContainer(newImage, targetCoverSlot);

  const albumTreeImages = album.m_treeV5.m_cover_subtree.m_tree_tmages.filter(
    (image) => image.m_folderID !== e.over?.data.current?.id
  );
  albumTreeImages.push(newImage);
  album.m_treeV5.m_cover_subtree.m_tree_tmages = albumTreeImages;
  album.m_treeV5.m_cover_subtree.m_next_folderID++;

  useAlbumTreeCovers.getState().setNeedUpdate(true);
  return album;
};

export const updateCoverImagesCropAndOrientation = (
  album: PhotoAlbum,
  imageTypeFolders: Folder[],
  activeImageId: string,
  overImageId: string
): void => {
  const coverImages = album.m_treeV5?.m_cover_subtree.m_tree_tmages;
  if (!coverImages) return;

  const activeId = parseInt(activeImageId);
  const overId = parseInt(overImageId);

  [activeId, overId].forEach((imageId) => {
    const imageFolder = imageTypeFolders.find(
      (folder) => folder.m_folderID === imageId
    );
    const image = coverImages.find((img) => img.m_folderID === imageId);

    if (imageFolder && image) {
      const dimensions = parseSizeLayout(imageFolder.m_size);
      updateImageCropAndOrientation(image, dimensions.width, dimensions.height);
    }
  });
};