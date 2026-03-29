import { theme } from '@/constants/theme';
import type { PhotoAlbum } from '@/types/tree';
import { resolveCoverBackgrounds } from '@/utils/cover-backgrounds';
import { Image as RNImage, StyleSheet, View } from 'react-native';

type BackCoverViewProps = {
  album: PhotoAlbum;
  width: number;
  isRTL: boolean;
};

/**
 * Renders the back cover of the album, matching the web's BackCover component.
 * Shows a mirrored cover background, center spine overlay, and a color overlay
 * representing the inner back cover surface.
 */
export function BackCoverView({ album, width, isRTL }: BackCoverViewProps) {
  const { backCoverBackground } = resolveCoverBackgrounds(album);

  // Match the front cover aspect ratio
  const coverSpread = album.m_treeV5.m_cover_subtree.m_spread_folders?.[0];
  if (!coverSpread) return null;

  const children = (coverSpread.m_child_folders ?? []).filter(Boolean);
  const frontRegion = children.find((f) =>
    isRTL
      ? f?.m_type === 'COVER_LEFT_REGION_TYPE'
      : f?.m_type === 'COVER_RIGHT_REGION_TYPE'
  );

  if (!frontRegion) return null;

  const [regionW, regionH] = frontRegion.m_size.split(',').map(Number);
  const scaledHeight = (width * regionH) / regionW;

  const bgColor = backCoverBackground.color ?? theme.colors.background;

  return (
    <View style={[styles.container, { width }]}>
      <View style={[styles.backCover, { width, height: scaledHeight }]}>
        {/* Mirrored cover background image */}
        {backCoverBackground.imageUrl ? (
          <RNImage
            source={{ uri: backCoverBackground.imageUrl }}
            style={[StyleSheet.absoluteFillObject, styles.mirroredBg]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: bgColor },
            ]}
          />
        )}

        {/* Center spine overlay */}
        <View style={styles.spine} />

        {/* Inner color overlay (the actual back cover surface) */}
        <View
          style={[
            styles.innerSurface,
            { backgroundColor: bgColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  backCover: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 2,
  },
  mirroredBg: {
    transform: [{ scaleX: -1 }],
  },
  spine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '43%',
    width: '14%',
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 1,
  },
  innerSurface: {
    position: 'absolute',
    top: '2.1%',
    bottom: '2.1%',
    left: '1.1%',
    right: '1.1%',
    borderRadius: 1,
    zIndex: 2,
  },
});
