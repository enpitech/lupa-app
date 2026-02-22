import { getImageUrl } from '@/services/api/config';
import type { Image as AlbumImage } from '@/types/tree';
import { Image, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

type ImageSlotProps = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  image: AlbumImage | undefined;
  eventToken: string;
  onPress?: () => void;
};

export function ImageSlot({
  leftPct,
  topPct,
  widthPct,
  heightPct,
  image,
  eventToken,
  onPress,
}: ImageSlotProps) {
  const slotStyle: ViewStyle = {
    position: 'absolute',
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    overflow: 'hidden',
  };

  if (!image) {
    return <View style={[slotStyle, styles.empty]} />;
  }

  const imageUrl = getImageUrl({
    imgName: image.m_image_name,
    eventToken,
    type: 'medium',
  });

  // crop_rect values are normalized (0-1): the visible portion of the image
  const cropRect = image.m_crop_rect;

  // Scale image so the crop region fills the container exactly
  const imgWidthPct = (1 / cropRect.Width) * 100;
  const imgHeightPct = (1 / cropRect.Height) * 100;
  const imgLeftPct = -(cropRect.X / cropRect.Width) * 100;
  const imgTopPct = -(cropRect.Y / cropRect.Height) * 100;

  const content = (
    <Image
      source={{ uri: imageUrl }}
      style={{
        position: 'absolute',
        left: `${imgLeftPct}%`,
        top: `${imgTopPct}%`,
        width: `${imgWidthPct}%`,
        height: `${imgHeightPct}%`,
      }}
      resizeMode="stretch"
    />
  );

  if (onPress) {
    return (
      <Pressable style={slotStyle} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={slotStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: '#f0f0f0',
  },
});
