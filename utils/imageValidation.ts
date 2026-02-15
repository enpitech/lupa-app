import { ImageData } from '@/stores/album/types';

export type InvalidImageReason = 'invalid_dimensions' | 'missing_album_data';

export const hasValidDimensions = (
  image: ImageData | undefined | null
): boolean => {
  if (!image) return false;

  return (
    Number.isFinite(image.imageMediumWidth) &&
    Number.isFinite(image.imageMediumHeight) &&
    image.imageMediumWidth > 0 &&
    image.imageMediumHeight > 0
  );
};

export const isInvalidImageData = (
  image: ImageData | undefined | null
): boolean => {
  if (!image) return true;
  return !hasValidDimensions(image);
};

export const getInvalidImageReason = (
  image: ImageData | undefined | null
): InvalidImageReason | null => {
  if (!image) return 'missing_album_data';

  if (!hasValidDimensions(image)) {
    return 'invalid_dimensions';
  }

  return null;
};
