import { Image } from '@/types/tree';
import { PageMode } from '@/types/editor';
import { Album } from '@/stores/album/types';
import { validateAndFixCropRect } from '@/lib/utils/albumUtils';
import { trackError } from '@/utils/datadogErrorTracking';

export enum JPEG_ORIENTATION {
  NOTUSED = 0,
  JPEG_NORMAL = 1,
  MIRROR_HORIZONTAL = 2,
  ROTATE_180 = 3,
  MIRROR_VERTICAL = 4,
  MIRROR_HORIZONTAL_270 = 5,
  ROTATE_90 = 6,
  MIRROR_HORIZONTAL_90 = 7,
  ROTATE_270 = 8,
}

export const getRadiansFromOrientation = (
  orientation: string | undefined,
  alignment: number
): { rotationRad: number; flipX: boolean; flipY: boolean } => {
  if (!orientation) {
    return { rotationRad: 0, flipX: false, flipY: false };
  }
  const alignmentRadians = (alignment * Math.PI) / 180;
  switch (orientation) {
    case 'JPEG_NORMAL':
      return { rotationRad: 0 + alignmentRadians, flipX: false, flipY: false };
    case 'MIRROR_HORIZONTAL':
      return { rotationRad: 0 + alignmentRadians, flipX: true, flipY: false };
    case 'ROTATE_180':
      return {
        rotationRad: Math.PI + alignmentRadians,
        flipX: false,
        flipY: false,
      };
    case 'MIRROR_VERTICAL':
      return { rotationRad: 0 + alignmentRadians, flipX: false, flipY: true };
    case 'MIRROR_HORIZONTAL_270':
      return {
        rotationRad: 1.5 * Math.PI + alignmentRadians,
        flipX: true,
        flipY: false,
      };
    case 'ROTATE_90':
      return {
        rotationRad: Math.PI / 2 + alignmentRadians,
        flipX: false,
        flipY: false,
      };
    case 'MIRROR_HORIZONTAL_90':
      return {
        rotationRad: Math.PI / 2 + alignmentRadians,
        flipX: true,
        flipY: false,
      };
    case 'ROTATE_270':
      return {
        rotationRad: 1.5 * Math.PI + alignmentRadians,
        flipX: false,
        flipY: false,
      };
    default:
      return { rotationRad: 0 + alignmentRadians, flipX: false, flipY: false };
  }
};

export const calculateRotationAndFlip = (
  rotationRad: number,
  flipX: boolean = false,
  flipY: boolean = false
): { orientationEnum: JPEG_ORIENTATION; alignmentRad: number } => {
  let rot = rotationRad;
  let fX = flipX;
  let fY = flipY;

  if (fX && fY) {
    rot = rotationRad + Math.PI;
    fX = false;
    fY = false;
  }

  rot = rot % (2 * Math.PI);
  rot = (rot + 2 * Math.PI) % (2 * Math.PI);
  if (rot < 0) {
    rot = 2 * Math.PI - rot;
  }

  let orientation = Math.round(rot / (Math.PI / 2));

  let alignment = rot - orientation * (Math.PI / 2);
  if (alignment > Math.PI / 4) {
    alignment = alignment - Math.PI / 2;
    orientation++;
  } else if (alignment < -Math.PI / 4) {
    alignment = alignment + Math.PI / 2;
    orientation--;
  }

  if (Math.abs(alignment) < 0.001) {
    alignment = 0;
  }

  orientation = (orientation + 4) % 4;

  if ((orientation & 0x1) !== 0 && (fX || fY)) {
    fX = !fX;
    fY = !fY;
  }

  let orientationEnum: JPEG_ORIENTATION = JPEG_ORIENTATION.JPEG_NORMAL;

  switch (orientation) {
    case 0: // 0 degrees
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.JPEG_NORMAL;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL;
      else if (!fX && fY) orientationEnum = JPEG_ORIENTATION.MIRROR_VERTICAL;
      else orientationEnum = JPEG_ORIENTATION.ROTATE_180;
      break;
    case 1: // 90 degrees
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_90;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_90;
      else if (!fX && fY)
        orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL_90;
      else orientationEnum = JPEG_ORIENTATION.ROTATE_90;
      break;
    case 2: // 180 degrees
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_180;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.MIRROR_VERTICAL;
      else if (!fX && fY) orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL;
      else orientationEnum = JPEG_ORIENTATION.JPEG_NORMAL;
      break;
    case 3: // 270 degrees
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_270;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_270;
      else if (!fX && fY)
        orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL_270;
      else orientationEnum = JPEG_ORIENTATION.ROTATE_270;
      break;
  }

  return { orientationEnum, alignmentRad: alignment };
};

export function calcExtendedAreaSize(
  alignment: number,
  orientationDegrees: number,
  imgWidth: number,
  imgHeight: number
): { width: number; height: number } {
  const cathetus = Math.sin((Math.abs(alignment) * Math.PI) / 180);
  const correctionWidth = imgHeight * cathetus;
  const correctionHeight = imgWidth * cathetus;
  if (orientationDegrees === 0 || orientationDegrees === 180) {
    return {
      width: imgWidth + correctionWidth,
      height: imgHeight + correctionHeight,
    };
  } else {
    return {
      width: imgHeight + correctionHeight,
      height: imgWidth + correctionWidth,
    };
  }
}
/**
 * Calculates dimensions with a maximum constraint while maintaining aspect ratio
 */
function calculateMaxDimensionWithAspectRatio(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } {
  const aspectRatio = width / height;

  if (width >= height) {
    return {
      width: maxDimension,
      height: maxDimension / aspectRatio,
    };
  } else {
    return {
      height: maxDimension,
      width: maxDimension * aspectRatio,
    };
  }
}

export function orientationEnumToDegrees(
  orientation: JPEG_ORIENTATION
): number {
  switch (orientation) {
    case JPEG_ORIENTATION.ROTATE_90:
    case JPEG_ORIENTATION.MIRROR_HORIZONTAL_90:
      return 90;
    case JPEG_ORIENTATION.ROTATE_180:
      return 180;
    case JPEG_ORIENTATION.ROTATE_270:
    case JPEG_ORIENTATION.MIRROR_HORIZONTAL_270:
      return 270;
    default:
      return 0;
  }
}
export function getAreaSizeAfterAlignmentAndOrientation(
  alignmentDeg: number,
  orientationDegrees: number,
  originalWidth: number,
  originalHeight: number
): { areaWidth: number; areaHeight: number } {
  let areaWidth = originalWidth;
  let areaHeight = originalHeight;
  if (alignmentDeg !== 0) {
    const ext = calcExtendedAreaSize(
      alignmentDeg,
      orientationDegrees,
      originalWidth,
      originalHeight
    );
    areaWidth = ext.width;
    areaHeight = ext.height;
  } else {
    if (orientationDegrees === 90 || orientationDegrees === 270) {
      areaWidth = originalHeight;
      areaHeight = originalWidth;
    }
  }
  return { areaWidth, areaHeight };
}

/**
 * Applies rotation to dimensions based on sine and cosine values
 */
function calculateRotatedDimensions(
  width: number,
  height: number,
  absCos: number,
  absSin: number
): { width: number; height: number } {
  return {
    width: width * absCos + height * absSin,
    height: width * absSin + height * absCos,
  };
}

export function getImageCropData(
  imageFromTree: Image,
  albumStore: Album | null,
  mode: PageMode = 'editor',
  snapshotMode: boolean = false
) {
  const alignmentDegrees = imageFromTree?.m_alignment || 0;
  const alignmentRadians = (alignmentDegrees * Math.PI) / 180;
  const rotationObj = getRadiansFromOrientation(
    imageFromTree?.m_orientation,
    alignmentRadians
  );
  const rotationRe = rotationObj.rotationRad;
  const mediumWidth = imageFromTree?.m_medium_width_px || 0;
  const originalImage = albumStore?.img_arr.find(
    (img) => img.uniqueId == imageFromTree?.m_unique_id
  );
  const originalImageWidth = originalImage?.imageOriginalWidth || 0;
  const mediumHeight = imageFromTree?.m_medium_height_px || 0;
  const combinedRotation = rotationObj.rotationRad;
  const absCos = Math.abs(Math.cos(combinedRotation));
  const absSin = Math.abs(Math.sin(combinedRotation));

  // During snapshot generation, use sidebar's optimized dimensions (400px max) for better performance
  let rotatedWidth: number;
  let rotatedHeight: number;
  if (mode === 'sidebar' || snapshotMode) {
    const MAX_DIMENSION = 400;
    const { width: adjustedWidth, height: adjustedHeight } =
      calculateMaxDimensionWithAspectRatio(
        mediumWidth,
        mediumHeight,
        MAX_DIMENSION
      );

    // Apply rotation after setting the max dimension
    ({ width: rotatedWidth, height: rotatedHeight } =
      calculateRotatedDimensions(
        adjustedWidth,
        adjustedHeight,
        absCos,
        absSin
      ));
  } else {
    // Original calculation for editor mode
    ({ width: rotatedWidth, height: rotatedHeight } =
      calculateRotatedDimensions(mediumWidth, mediumHeight, absCos, absSin));
  }
  const crop_rect = { ...imageFromTree?.m_crop_rect };

  const validatedCrop = validateAndFixCropRect(
    crop_rect,
    'imageOrientation.ts:getImageCropData',
    imageFromTree
  );
  const {
    X: cropX,
    Y: cropY,
    Width: cropWidth,
    Height: cropHeight,
  } = validatedCrop;

  if (
    imageFromTree &&
    (!Number.isFinite(rotatedWidth) ||
      rotatedWidth <= 0 ||
      !Number.isFinite(rotatedHeight) ||
      rotatedHeight <= 0 ||
      !Number.isFinite(mediumHeight) ||
      mediumHeight <= 0 ||
      !Number.isFinite(mediumWidth) ||
      mediumWidth <= 0)
  ) {
    const error = new Error('Invalid dimensions in getImageCropData');

    trackError(error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'getImageCropData',
      imageFolderId: imageFromTree.m_folderID,
      imageName: imageFromTree.m_image_name,
      imageUniqueId: imageFromTree.m_unique_id,
      rotatedWidth,
      rotatedHeight,
      mediumWidth,
      mediumHeight,
    });

    rotatedWidth = 1;
    rotatedHeight = 1;
  }

  const cropData = {
    x: rotatedWidth * cropX,
    y: rotatedHeight * cropY,
    width: rotatedWidth * cropWidth,
    height: rotatedHeight * cropHeight,
  };
  return {
    rotationRe,
    mediumWidth,
    mediumHeight,
    originalImageWidth,
    rotatedWidth,
    rotatedHeight,
    cropData,
  };
}
