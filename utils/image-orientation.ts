import type { Image as AlbumImage, Rect } from '@/types/tree';

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

const JPEG_ORIENTATION_NAMES: Record<number, string> = {
  [JPEG_ORIENTATION.NOTUSED]: 'NOTUSED',
  [JPEG_ORIENTATION.JPEG_NORMAL]: 'JPEG_NORMAL',
  [JPEG_ORIENTATION.MIRROR_HORIZONTAL]: 'MIRROR_HORIZONTAL',
  [JPEG_ORIENTATION.ROTATE_180]: 'ROTATE_180',
  [JPEG_ORIENTATION.MIRROR_VERTICAL]: 'MIRROR_VERTICAL',
  [JPEG_ORIENTATION.MIRROR_HORIZONTAL_270]: 'MIRROR_HORIZONTAL_270',
  [JPEG_ORIENTATION.ROTATE_90]: 'ROTATE_90',
  [JPEG_ORIENTATION.MIRROR_HORIZONTAL_90]: 'MIRROR_HORIZONTAL_90',
  [JPEG_ORIENTATION.ROTATE_270]: 'ROTATE_270',
};

function calculateRotationAndFlip(
  rotationRad: number,
  flipX: boolean = false,
  flipY: boolean = false
): { orientationEnum: JPEG_ORIENTATION; alignmentRad: number } {
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

  let orientation = Math.round(rot / (Math.PI / 2));
  let alignment = rot - orientation * (Math.PI / 2);

  if (alignment > Math.PI / 4) {
    alignment -= Math.PI / 2;
    orientation++;
  } else if (alignment < -Math.PI / 4) {
    alignment += Math.PI / 2;
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

  let orientationEnum = JPEG_ORIENTATION.JPEG_NORMAL;
  switch (orientation) {
    case 0:
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.JPEG_NORMAL;
      else if (fX && !fY)
        orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL;
      else if (!fX && fY) orientationEnum = JPEG_ORIENTATION.MIRROR_VERTICAL;
      else orientationEnum = JPEG_ORIENTATION.ROTATE_180;
      break;
    case 1:
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_90;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_90;
      else if (!fX && fY)
        orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL_90;
      else orientationEnum = JPEG_ORIENTATION.ROTATE_90;
      break;
    case 2:
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_180;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.MIRROR_VERTICAL;
      else if (!fX && fY)
        orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL;
      else orientationEnum = JPEG_ORIENTATION.JPEG_NORMAL;
      break;
    case 3:
      if (!fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_270;
      else if (fX && !fY) orientationEnum = JPEG_ORIENTATION.ROTATE_270;
      else if (!fX && fY)
        orientationEnum = JPEG_ORIENTATION.MIRROR_HORIZONTAL_270;
      else orientationEnum = JPEG_ORIENTATION.ROTATE_270;
      break;
  }

  return { orientationEnum, alignmentRad: alignment };
}

function orientationEnumToDegrees(orientation: JPEG_ORIENTATION): number {
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

function getAreaSizeAfterAlignmentAndOrientation(
  alignmentDeg: number,
  orientationDegrees: number,
  originalWidth: number,
  originalHeight: number
): { areaWidth: number; areaHeight: number } {
  if (alignmentDeg !== 0) {
    const cathetus = Math.sin((Math.abs(alignmentDeg) * Math.PI) / 180);
    const correctionWidth = originalHeight * cathetus;
    const correctionHeight = originalWidth * cathetus;
    if (orientationDegrees === 0 || orientationDegrees === 180) {
      return {
        areaWidth: originalWidth + correctionWidth,
        areaHeight: originalHeight + correctionHeight,
      };
    }
    return {
      areaWidth: originalHeight + correctionHeight,
      areaHeight: originalWidth + correctionWidth,
    };
  }
  if (orientationDegrees === 90 || orientationDegrees === 270) {
    return { areaWidth: originalHeight, areaHeight: originalWidth };
  }
  return { areaWidth: originalWidth, areaHeight: originalHeight };
}

function validateAndFixCropRect(cropRect: Rect): Rect {
  const fixed = { ...cropRect };
  if (!Number.isFinite(fixed.X) || fixed.X < 0) fixed.X = 0;
  if (!Number.isFinite(fixed.Y) || fixed.Y < 0) fixed.Y = 0;
  if (!Number.isFinite(fixed.Width) || fixed.Width <= 0) fixed.Width = 1;
  if (!Number.isFinite(fixed.Height) || fixed.Height <= 0) fixed.Height = 1;
  return fixed;
}

/**
 * Converts Pintura's imageState into album tree image properties.
 * Mirrors the web app's `updateAlbumImageCrop` from `changeImageByLayout.ts`.
 */
export function applyPinturaStateToImage(
  image: AlbumImage,
  imageState: {
    crop?: { x: number; y: number; width: number; height: number };
    rotation?: number;
    flipX?: boolean;
    flipY?: boolean;
  }
): AlbumImage {
  const updated = { ...image };

  const rotation = imageState.rotation ?? 0;
  const flipX = imageState.flipX ?? false;
  const flipY = imageState.flipY ?? false;

  const { orientationEnum, alignmentRad } = calculateRotationAndFlip(
    rotation,
    flipX,
    flipY
  );

  updated.m_orientation =
    JPEG_ORIENTATION_NAMES[orientationEnum] ?? 'JPEG_NORMAL';
  const alignmentDeg = alignmentRad * (180 / Math.PI);
  updated.m_alignment = alignmentDeg;

  const originalWidth = updated.m_medium_width_px;
  const originalHeight = updated.m_medium_height_px;
  const orientationDegrees = orientationEnumToDegrees(orientationEnum);

  let { areaWidth, areaHeight } = getAreaSizeAfterAlignmentAndOrientation(
    alignmentDeg,
    orientationDegrees,
    originalWidth,
    originalHeight
  );

  if (
    !Number.isFinite(areaWidth) ||
    areaWidth <= 0 ||
    !Number.isFinite(areaHeight) ||
    areaHeight <= 0
  ) {
    areaWidth = originalWidth;
    areaHeight = originalHeight;
  }

  const cropX = Math.abs(imageState.crop?.x ?? 0);
  const cropY = Math.abs(imageState.crop?.y ?? 0);
  const cropWidth = imageState.crop?.width ?? areaWidth;
  const cropHeight = imageState.crop?.height ?? areaHeight;

  updated.m_crop_rect = validateAndFixCropRect({
    X: cropX / areaWidth,
    Y: cropY / areaHeight,
    Width: cropWidth / areaWidth,
    Height: cropHeight / areaHeight,
  });

  return updated;
}
