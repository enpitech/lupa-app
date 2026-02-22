import type { AlbumText } from '@/types/tree';
import { Text, View, type ViewStyle } from 'react-native';

type TextSlotProps = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  albumText: AlbumText;
  scaledPageHeight: number;
  pageHeightPx: number;
};

export function TextSlot({
  leftPct,
  topPct,
  widthPct,
  heightPct,
  albumText,
  scaledPageHeight,
  pageHeightPx,
}: TextSlotProps) {
  const textData = albumText.m_text;
  if (!textData.m_text_str) return null;

  const treeFontSize = textData.m_base.m_font_size_px;
  const scaledFontSize = treeFontSize
    ? (treeFontSize / pageHeightPx) * scaledPageHeight
    : scaledPageHeight * 0.03;

  const isRTL = textData.m_direction === 'RTL';

  const slotStyle: ViewStyle = {
    position: 'absolute',
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    justifyContent: 'center',
    overflow: 'hidden',
  };

  return (
    <View style={slotStyle}>
      <Text
        style={{
          fontSize: scaledFontSize,
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
          color: '#000',
          includeFontPadding: false,
        }}
        numberOfLines={2}
      >
        {textData.m_text_str}
      </Text>
    </View>
  );
}
