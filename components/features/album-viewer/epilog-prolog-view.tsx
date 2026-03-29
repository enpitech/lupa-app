import { theme } from '@/constants/theme';
import type { EpilogPrologData } from '@/services/api/fetch-epilog-prolog';
import type { PhotoAlbum } from '@/types/tree';
import { resolveBackground } from '@/utils/page-background';
import {
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type EpilogPrologViewProps = {
  data: EpilogPrologData;
  album: PhotoAlbum;
  eventToken: string;
  width: number;
};

type RenderSection = {
  text: string;
  align: 'left' | 'right' | 'center';
  fontSize: number;
};

function normalizeColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  if (color.startsWith('#') && color.length === 9) {
    const rrggbb = color.slice(3);
    const aa = color.slice(1, 3);
    return `#${rrggbb}${aa}`;
  }
  return color;
}

function isColorValue(value: string | undefined): boolean {
  return !!value && value.includes('#');
}

function normalizeText(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/<br\s*\/?>(\r?\n)?/gi, '\n').trim();
}

function normalizeDirection(value: string | undefined): 'rtl' | 'ltr' {
  const normalized = (value ?? '').toLowerCase();
  return normalized === 'rtl' || normalized === 'right' ? 'rtl' : 'ltr';
}

function toSectionAlignment(
  align: string | undefined,
  fallbackDirection: 'rtl' | 'ltr'
): 'left' | 'right' | 'center' {
  const normalized = (align ?? '').toLowerCase();
  if (normalized === 'left' || normalized === 'right' || normalized === 'center') {
    return normalized;
  }
  return fallbackDirection === 'rtl' ? 'right' : 'left';
}

function getScaledFontSize(base: number | undefined, pageWidth: number): number {
  const widthScale = pageWidth / 1650;
  const source = base ?? 64;
  return Math.max(12, Math.min(42, source * widthScale));
}

function getStructuredSections(
  data: EpilogPrologData,
  pageWidth: number,
  direction: 'rtl' | 'ltr'
): RenderSection[] {
  if ('text_str' in data) return [];

  const title = data.title ?? data.header;
  const sections = [title, data.body, data.footer].filter(Boolean);

  return sections
    .map((section) => {
      const text = normalizeText(section?.text);
      if (!text) return null;

      return {
        text,
        align: toSectionAlignment(section?.align, direction),
        fontSize: getScaledFontSize(section?.settings?.font_size, pageWidth),
      } as RenderSection;
    })
    .filter(Boolean) as RenderSection[];
}

function getLegacySection(
  data: EpilogPrologData,
  pageWidth: number,
  direction: 'rtl' | 'ltr'
): RenderSection | null {
  if (!('text_str' in data)) return null;

  const text = normalizeText(data.text_str);
  if (!text) return null;

  return {
    text,
    align: direction === 'rtl' ? 'right' : 'left',
    fontSize: getScaledFontSize(data.font_size, pageWidth),
  };
}

function getQrLink(data: EpilogPrologData): string {
  return typeof data.qrlink === 'string' ? data.qrlink.trim() : '';
}

function toOpenableUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  if (rawUrl.startsWith('www.')) {
    return `https://${rawUrl}`;
  }
  return null;
}

export function EpilogPrologView({
  data,
  album,
  eventToken,
  width,
}: EpilogPrologViewProps) {
  const direction = normalizeDirection(data.direction);
  // The page is half the spread width (single page)
  const pageWidth = width / 2;
  const pageHeight = pageWidth * 1.4; // approximate page ratio

  // bg_color may be a hex color or a picture ID (e.g. ClientsPages\prologue_preview.png)
  const bgValue = data.bg_color;
  const bgIsColor = isColorValue(bgValue);
  const backgroundColor = bgIsColor
    ? normalizeColor(bgValue, theme.colors.background)
    : theme.colors.background;

  // When bg_color is a picture ID, resolve it to an image URL
  const bgImage =
    bgValue && !bgIsColor
      ? resolveBackground(bgValue, album, eventToken)
      : null;

  const textColor = normalizeColor(data.font_color, theme.colors.text);

  const structuredSections = getStructuredSections(data, pageWidth, direction);
  const legacySection = getLegacySection(data, pageWidth, direction);
  const sections =
    structuredSections.length > 0
      ? structuredSections
      : legacySection
        ? [legacySection]
        : [];

  const qrlink = getQrLink(data);
  const openableUrl = toOpenableUrl(qrlink);

  const textContent = (
    <>
      {sections.map((section, index) => (
        <Text
          key={`${section.text}-${index}`}
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: section.fontSize,
              lineHeight: section.fontSize * 1.35,
              textAlign: section.align,
              writingDirection: direction,
            },
            index === sections.length - 1 ? null : styles.sectionSpacing,
          ]}
        >
          {section.text}
        </Text>
      ))}

      {openableUrl ? (
        <Pressable
          style={styles.qrLinkContainer}
          onPress={() => {
            Linking.openURL(openableUrl);
          }}
        >
          <Text
            style={[
              styles.qrLinkText,
              {
                textAlign: direction === 'rtl' ? 'right' : 'left',
                writingDirection: direction,
              },
            ]}
          >
            {qrlink}
          </Text>
        </Pressable>
      ) : null}
    </>
  );

  const pageStyle = [
    styles.page,
    {
      width: pageWidth,
      height: pageHeight,
      backgroundColor,
    },
  ];

  return (
    <View style={[styles.container, { width }]}>
      {bgImage?.imageUrl ? (
        <ImageBackground
          source={{ uri: bgImage.imageUrl }}
          style={pageStyle}
          resizeMode="cover"
        >
          {textContent}
        </ImageBackground>
      ) : (
        <View style={pageStyle}>{textContent}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  page: {
    padding: 24,
    justifyContent: 'center',
  },
  text: {
    ...theme.typography.body,
  },
  sectionSpacing: {
    marginBottom: theme.spacing.md,
  },
  qrLinkContainer: {
    marginTop: theme.spacing.md,
  },
  qrLinkText: {
    ...theme.typography.caption,
    color: theme.colors.tint,
    textDecorationLine: 'underline',
  },
});
