import type { AlbumText, Folder, Image, PhotoAlbum } from '@/types/tree';
import { StyleSheet, View } from 'react-native';
import { PageView } from './page-view';

type SpreadViewProps = {
  spread: Folder;
  images: Image[];
  texts: AlbumText[];
  eventToken: string;
  album: PhotoAlbum;
  width: number;
  isRTL: boolean;
  onImagePress?: (folderID: number) => void;
};

export function SpreadView({
  spread,
  images,
  texts,
  eventToken,
  album,
  width,
  isRTL,
  onImagePress,
}: SpreadViewProps) {
  const pages = (spread.m_child_folders ?? []).filter(Boolean) as Folder[];
  const pageWidth = width / 2;

  // For RTL books, reverse the visual page order within a spread
  const orderedPages = isRTL ? [...pages].reverse() : pages;

  return (
    <View style={[styles.container, { width }]}>
      {orderedPages.map((page) => (
        <PageView
          key={`page-${spread.m_folderID}-${page.m_folderID}`}
          page={page}
          images={images}
          texts={texts}
          eventToken={eventToken}
          album={album}
          availableWidth={pageWidth}
          onImagePress={onImagePress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
