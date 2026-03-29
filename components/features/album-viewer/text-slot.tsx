import type { AlbumText } from '@/types/tree';
import type { ResolvedTextStyle } from '@/utils/tree-colors';
import { applyAlpha } from '@/utils/tree-colors';
import { Text, View, type ViewStyle } from 'react-native';

function resolveTextAlign(
  alignment: string | undefined,
  isRTL: boolean
): 'left' | 'center' | 'right' {
  switch (alignment?.toUpperCase()) {
    case 'CENTER':
      return 'center';
    case 'LEFT':
      return 'left';
    case 'RIGHT':
      return 'right';
    default:
      return isRTL ? 'right' : 'left';
  }
}

/** Scale factor applied to page text font sizes (matches web SCALE_FACTOR). */
const PAGE_TEXT_SCALE_FACTOR = 0.8;

type TextSlotProps = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  albumText: AlbumText;
  scaledPageHeight: number;
  pageHeightPx: number;
  style: ResolvedTextStyle;
  isCover?: boolean;
};

export function TextSlot({
  leftPct,
  topPct,
  widthPct,
  heightPct,
  albumText,
  scaledPageHeight,
  pageHeightPx,
  style,
  isCover = false,
}: TextSlotProps) {
  const textData = albumText.m_text;
  if (!textData.m_text_str) return null;

  const treeFontSize = textData.m_base.m_font_size_px;
  const scaleFactor = isCover ? 1 : PAGE_TEXT_SCALE_FACTOR;
  const scaledFontSize = treeFontSize
    ? (treeFontSize / pageHeightPx) * scaledPageHeight * scaleFactor
    : scaledPageHeight * 0.03;

  const isRTL = textData.m_direction === 'RTL';
  const textAlign = resolveTextAlign(
    albumText.m_textbox_horizontal_alignment,
    isRTL
  );

  const slotStyle: ViewStyle = {
    position: 'absolute',
    left: `${leftPct}%`,
    top: `${topPct}%`,
    width: `${widthPct}%`,
    height: `${heightPct}%`,
    justifyContent: 'center',
    overflow: 'hidden',
    ...(style.backgroundColor && style.backgroundOpacity > 0
      ? { backgroundColor: applyAlpha(style.backgroundColor, style.backgroundOpacity) }
      : undefined),
  };

  return (
    <View style={slotStyle}>
      <Text
        style={{
          fontSize: scaledFontSize,
          lineHeight: scaledFontSize,
          textAlign,
          writingDirection: isRTL ? 'rtl' : 'ltr',
          color: style.textColor,
          fontFamily: 'LupaSans-Regular',
          includeFontPadding: false,
        }}
        numberOfLines={2}
      >
        {textData.m_text_str}
      </Text>
    </View>
  );
}
