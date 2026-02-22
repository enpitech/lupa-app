import { theme } from '@/constants/theme';
import { env } from '@/config/env';
import { getImageUrl } from '@/services/api/config';
import { useUserStore } from '@/stores/user';
import type { AlbumText, Folder, Image, PhotoAlbum } from '@/types/tree';
import {
  getCoverImages,
  getCoverSpreadFolders,
  getCoverTexts,
  getTextForFolder,
} from '@/types/tree';
import {
  Image as RNImage,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

type CoverViewProps = {
  album: PhotoAlbum;
  eventToken: string;
  width: number;
  isRTL: boolean;
};

function parseSizeString(size: string): { width: number; height: number } {
  const [w, h] = size.split(',').map(Number);
  return { width: w, height: h };
}

function buildCoverBackgroundUrl(
  album: PhotoAlbum,
  region: Folder
): string | null {
  const urlInfoOptions = album.m_treeV5.m_cover_subtree.m_url_information;
  const urlInfo =
    urlInfoOptions?.find((info) => info.m_folderID === region.m_folderID) ||
    urlInfoOptions?.[0];
  const queryParams = urlInfo?.m_urlInfo;
  if (!queryParams) return null;

  const pictureName = region.m_background?.m_color_im_id;
  if (!pictureName) return null;

  const user = useUserStore.getState().user;
  const defaultParams = {
    picture: pictureName,
    size: 'medium',
    isCustomErr: 'false',
    cloudcode: env.CLOUD_CODE,
    app_version: '3.5.27.tf',
    device_type: 'mobile',
    token: user?.token ?? '',
  };

  const extraParams = Object.entries(defaultParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');

  return `${env.RESOURCES_IMAGE_URL}?${queryParams}&${extraParams}`;
}

export function CoverView({
  album,
  eventToken,
  width,
  isRTL,
}: CoverViewProps) {
  const coverSpreads = getCoverSpreadFolders(album);
  const coverImages = getCoverImages(album);
  const coverTexts = getCoverTexts(album);

  if (!coverSpreads.length) return null;

  const coverSpread = coverSpreads[0];
  const allChildren = (coverSpread.m_child_folders ?? []).filter(
    Boolean
  ) as Folder[];

  // Find the front cover region based on direction
  const frontRegion = allChildren.find((f) =>
    isRTL
      ? f.m_type === 'COVER_LEFT_REGION_TYPE'
      : f.m_type === 'COVER_RIGHT_REGION_TYPE'
  );

  if (!frontRegion) return null;

  const spreadSize = parseSizeString(coverSpread.m_size);
  const regionSize = parseSizeString(frontRegion.m_size);

  const scaledHeight = (width * regionSize.height) / regionSize.width;

  // Build cover background URL
  const backgroundUrl = buildCoverBackgroundUrl(album, frontRegion);

  // The background image is the full spread, so we need to show only the front region's portion
  // Scale: the full spread is wider than the region, so we scale up and offset
  const bgScaleX = spreadSize.width / regionSize.width;
  const bgScaleY = spreadSize.height / regionSize.height;
  const bgWidth = width * bgScaleX;
  const bgHeight = scaledHeight * bgScaleY;

  // Offset to show the correct region portion
  const regionOriginX = frontRegion.m_pivot.X - regionSize.width / 2;
  const regionOriginY = frontRegion.m_pivot.Y - regionSize.height / 2;
  const bgOffsetX = -(regionOriginX / spreadSize.width) * bgWidth;
  const bgOffsetY = -(regionOriginY / spreadSize.height) * bgHeight;

  // Collect image and text elements belonging to this region
  const regionPivotX = frontRegion.m_pivot.X;
  const imageElements = allChildren.filter((f) => f.m_type === 'IMAGE_TYPE');
  const textElements = allChildren.filter((f) => f.m_type === 'TITLE_TYPE');

  const otherRegion = allChildren.find((f) =>
    isRTL
      ? f.m_type === 'COVER_RIGHT_REGION_TYPE'
      : f.m_type === 'COVER_LEFT_REGION_TYPE'
  );
  const otherPivotX = otherRegion?.m_pivot.X ?? 0;

  const frontImageElements = imageElements.filter(
    (el) =>
      Math.abs(el.m_pivot.X - regionPivotX) <=
      Math.abs(el.m_pivot.X - otherPivotX)
  );

  const frontTextElements = textElements.filter(
    (el) =>
      Math.abs(el.m_pivot.X - regionPivotX) <=
      Math.abs(el.m_pivot.X - otherPivotX)
  );

  const elements = (
    <>
      {frontImageElements.map((imgFolder) => {
        const imgSize = parseSizeString(imgFolder.m_size);
        const image = coverImages.find(
          (img) => img.m_folderID === imgFolder.m_folderID
        );
        if (!image) return null;

        const relX = imgFolder.m_pivot.X - imgSize.width / 2 - regionOriginX;
        const relY = imgFolder.m_pivot.Y - imgSize.height / 2 - regionOriginY;

        const leftPct = (relX / regionSize.width) * 100;
        const topPct = (relY / regionSize.height) * 100;
        const widthPct = (imgSize.width / regionSize.width) * 100;
        const heightPct = (imgSize.height / regionSize.height) * 100;

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

        const slotStyle: ViewStyle = {
          position: 'absolute',
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          overflow: 'hidden',
        };

        return (
          <View key={`cover-img-${imgFolder.m_folderID}`} style={slotStyle}>
            <RNImage
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
          </View>
        );
      })}

      {frontTextElements.map((textFolder) => {
        const albumText = getTextForFolder(
          coverTexts,
          textFolder.m_folderID
        );
        if (!albumText?.m_text?.m_text_str) return null;

        const txtSize = parseSizeString(textFolder.m_size);
        const relX =
          textFolder.m_pivot.X - txtSize.width / 2 - regionOriginX;
        const relY =
          textFolder.m_pivot.Y - txtSize.height / 2 - regionOriginY;

        const leftPct = (relX / regionSize.width) * 100;
        const topPct = (relY / regionSize.height) * 100;
        const widthPct = (txtSize.width / regionSize.width) * 100;
        const heightPct = (txtSize.height / regionSize.height) * 100;

        const fontSize = albumText.m_text.m_base.m_font_size_px
          ? (albumText.m_text.m_base.m_font_size_px / regionSize.height) *
            scaledHeight
          : scaledHeight * 0.04;

        const isTextRTL = albumText.m_text.m_direction === 'RTL';

        return (
          <View
            key={`cover-txt-${textFolder.m_folderID}`}
            style={{
              position: 'absolute',
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              height: `${heightPct}%`,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize,
                textAlign: isTextRTL ? 'right' : 'left',
                writingDirection: isTextRTL ? 'rtl' : 'ltr',
                color: '#fff',
              }}
              numberOfLines={2}
            >
              {albumText.m_text.m_text_str}
            </Text>
          </View>
        );
      })}
    </>
  );

  const pageStyle: ViewStyle[] = [
    styles.coverPage,
    { width, height: scaledHeight },
  ];

  if (backgroundUrl) {
    return (
      <View style={[styles.container, { width }]}>
        <View style={[pageStyle, { overflow: 'hidden' }]}>
          {/* Background image showing just the front region portion */}
          <RNImage
            source={{ uri: backgroundUrl }}
            style={{
              position: 'absolute',
              left: bgOffsetX,
              top: bgOffsetY,
              width: bgWidth,
              height: bgHeight,
            }}
            resizeMode="stretch"
          />
          {elements}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width }]}>
      <View style={pageStyle}>{elements}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  coverPage: {
    backgroundColor: theme.colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
});
