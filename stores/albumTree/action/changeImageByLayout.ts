import { Image } from '@/types/tree';
import { PinturaImageState } from '@pqina/pintura';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import {
  JPEG_ORIENTATION,
  calculateRotationAndFlip,
  getAreaSizeAfterAlignmentAndOrientation,
  orientationEnumToDegrees,
} from './imageOrientation';
import { produce } from 'immer';
import { StoreWithTemporal } from '../useTemporalStore';
import { useAlbumTreeCovers } from '@/stores/cover';
import { validateAndFixCropRect } from '@/lib/utils/albumUtils';
import { Rect } from '@/types/tree';
import { trackError } from '@/utils/datadogErrorTracking';
const ALBUM_SUBTREES = ['m_book_subtree', 'm_cover_subtree'] as const;

const updateAlbumImageCrop = (
  image: Image,
  imageState: PinturaImageState
): Image => {
  const updatedImage = { ...image };

  const rotation = imageState.rotation ?? 0;
  const flipX = imageState.flipX ?? false;
  const flipY = imageState.flipY ?? false;

  const { orientationEnum, alignmentRad } = calculateRotationAndFlip(
    rotation,
    flipX,
    flipY
  );
  updatedImage.m_orientation = JPEG_ORIENTATION[orientationEnum] as string;
  const alignmentDeg = alignmentRad * (180 / Math.PI);
  updatedImage.m_alignment = alignmentDeg;

  const originalWidth = updatedImage.m_medium_width_px;
  const originalHeight = updatedImage.m_medium_height_px;

  const orientationDegrees = orientationEnumToDegrees(orientationEnum);

  let { areaWidth, areaHeight } = getAreaSizeAfterAlignmentAndOrientation(
    alignmentDeg,
    orientationDegrees,
    originalWidth,
    originalHeight
  );
  const isDimensionsInvalid =
    !Number.isFinite(areaWidth) ||
    areaWidth <= 0 ||
    !Number.isFinite(areaHeight) ||
    areaHeight <= 0 ||
    !Number.isFinite(originalHeight) ||
    originalHeight <= 0 ||
    !Number.isFinite(originalWidth) ||
    originalWidth <= 0;

  if (isDimensionsInvalid) {
    const error = new Error(
      'Invalid area dimensions calculated in changeImageByLayout'
    );

    trackError(error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'updateAlbumImageCrop',
      imageFolderId: updatedImage.m_folderID,
      imageName: updatedImage.m_image_name,
      calculatedAreaWidth: areaWidth,
      calculatedAreaHeight: areaHeight,
      originalWidth,
      originalHeight,
      alignmentDeg,
      orientationDegrees,
    });

    areaWidth = originalWidth;
    areaHeight = originalHeight;
  }

  const cropX = Math.abs(imageState.crop?.x ?? 0);
  const cropY = Math.abs(imageState.crop?.y ?? 0);
  const cropWidth = imageState.crop?.width ?? originalWidth;
  const cropHeight = imageState.crop?.height ?? originalHeight;
  const rectCrop: Rect = {
    X: cropX / areaWidth,
    Y: cropY / areaHeight,
    Width: cropWidth / areaWidth,
    Height: cropHeight / areaHeight,
  };
  updatedImage.m_crop_rect = validateAndFixCropRect(
    rectCrop,
    'changeImageByLayout.ts/updateAlbumImageCrop',
    updatedImage
  );

  return updatedImage;
};

const updateImageInSubtree =
  (id: number | string, imageState: PinturaImageState) =>
  (store: AlbumTreeStore) => {
    ALBUM_SUBTREES.forEach((key) => {
      if (!store.album?.m_treeV5) return;

      const subtree = store.album.m_treeV5[key];
      if (!subtree || !subtree.m_tree_tmages) return;

      const imageIndex = subtree.m_tree_tmages.findIndex(
        (image: Image) => image.m_folderID === id
      );
      if (imageIndex !== -1) {
        const image = subtree.m_tree_tmages[imageIndex];

        subtree.m_tree_tmages[imageIndex] = updateAlbumImageCrop(
          image,
          imageState
        );
        //if it is cover set flag to update cover executer
        if (key === 'm_cover_subtree') {
          useAlbumTreeCovers.getState().setNeedUpdate(true);
        }
      }
    });
  };

export const getChangeImageByLayoutAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['changeImageByLayout']
> =
  (set, _get, store: StoreWithTemporal) =>
  (id: number | string, imageState: PinturaImageState) => {
    const { pause, resume } = store.temporal?.getState?.() || {};

    if (pause) pause();

    set(produce(updateImageInSubtree(id, imageState)));

    if (resume) resume();
  };
