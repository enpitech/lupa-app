import { getImageUrl } from '@/services/api/config';
import type { Image as AlbumImage } from '@/types/tree';
import {
  doesOrientationSwapDimensions,
  getImageDisplayTransform,
} from '@/utils/image-orientation';
import { Image, type ImageStyle } from 'react-native';

type ImageContentProps = {
  image: AlbumImage;
  eventToken: string;
};

/** Renders a cropped, oriented image that fills its parent container. */
export function ImageContent({ image, eventToken }: ImageContentProps) {
  const imageUrl = getImageUrl({
    imgName: image.m_image_name,
    eventToken,
    type: 'medium',
  });

  const cropRect = image.m_crop_rect;
  const imgWidthPct = (1 / cropRect.Width) * 100;
  const imgHeightPct = (1 / cropRect.Height) * 100;
  const imgLeftPct = -(cropRect.X / cropRect.Width) * 100;
  const imgTopPct = -(cropRect.Y / cropRect.Height) * 100;

  const transform = getImageDisplayTransform(
    image.m_orientation,
    image.m_alignment
  );
  const swapsDimensions = doesOrientationSwapDimensions(image.m_orientation);

  const imageStyle: ImageStyle = {
    position: 'absolute',
    left: `${imgLeftPct}%`,
    top: `${imgTopPct}%`,
    width: `${swapsDimensions ? imgHeightPct : imgWidthPct}%`,
    height: `${swapsDimensions ? imgWidthPct : imgHeightPct}%`,
    ...(transform ? { transform } : undefined),
  };

  return (
    <Image source={{ uri: imageUrl }} style={imageStyle} resizeMode="stretch" />
  );
}
