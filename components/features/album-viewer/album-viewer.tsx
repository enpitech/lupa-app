import { theme } from '@/constants/theme';
import { queryKeys } from '@/constants/query-keys';
import { useTranslation } from '@/hooks/use-translation';
import { useUpdateTree } from '@/hooks/use-update-tree';
import { getImageUrl } from '@/services/api/config';
import { useImageEditorStore } from '@/stores/image-editor';
import type { PhotoAlbum } from '@/types/tree';
import { getImages, getSpreadFolders, getTexts } from '@/types/tree';
import { applyPinturaStateToImage } from '@/utils/image-orientation';
import { toast } from '@backpackapp-io/react-native-toast';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewToken,
} from 'react-native';
import { CoverView } from './cover-view';
import { EpilogPrologView } from './epilog-prolog-view';
import { SpreadView } from './spread-view';
import type { EpilogPrologData } from '@/services/api/fetch-epilog-prolog';

// A viewer item can be a cover, prolog, spread, or epilog
type ViewerItem =
  | { type: 'cover' }
  | { type: 'prolog'; data: EpilogPrologData }
  | { type: 'spread'; index: number }
  | { type: 'epilog'; data: EpilogPrologData };

type AlbumViewerProps = {
  album: PhotoAlbum;
  eventToken: string;
  prologData?: EpilogPrologData | null;
  epilogData?: EpilogPrologData | null;
};

export function AlbumViewer({
  album,
  eventToken,
  prologData,
  epilogData,
}: AlbumViewerProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();
  const updateTree = useUpdateTree({ eventToken });

  const spreads = getSpreadFolders(album);
  const images = getImages(album);
  const texts = getTexts(album);
  const isRTL = album.m_treeV5.m_album_direction === 'RTL';

  // Build ordered list of viewer items
  const items: ViewerItem[] = [];
  items.push({ type: 'cover' });
  if (prologData?.text_str) {
    items.push({ type: 'prolog', data: prologData });
  }
  spreads.forEach((_, index) => {
    items.push({ type: 'spread', index });
  });
  if (epilogData?.text_str) {
    items.push({ type: 'epilog', data: epilogData });
  }

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<ViewerItem>[];
  }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  const handleImagePress = (folderID: number) => {
    const image = images.find((img) => img.m_folderID === folderID);
    if (!image) return;

    const imageUrl = getImageUrl({
      imgName: image.m_image_name,
      eventToken,
      type: 'medium',
    });

    useImageEditorStore.getState().open({
      sourceUrl: imageUrl,
      folderID,
      eventToken,
      onResult: (imageState) => {
        // Build updated album with new crop/orientation
        const updatedImages = images.map((img) =>
          img.m_folderID === folderID
            ? applyPinturaStateToImage(img, imageState)
            : img
        );

        const updatedAlbum: PhotoAlbum = {
          ...album,
          m_treeV5: {
            ...album.m_treeV5,
            m_book_subtree: {
              ...album.m_treeV5.m_book_subtree,
              m_tree_tmages: updatedImages,
            },
          },
        };

        // Optimistically update the query cache
        queryClient.setQueryData(
          queryKeys.albums.tree(eventToken),
          updatedAlbum
        );

        // Save to server
        updateTree.mutate(
          { album: updatedAlbum },
          {
            onSuccess: () => {
              toast.success(t('imageEditor.saveSuccess'));
            },
            onError: (error) => {
              console.error('[AlbumViewer] Save failed:', error);
              toast.error(t('imageEditor.saveError'));
              queryClient.invalidateQueries({
                queryKey: queryKeys.albums.tree(eventToken),
              });
            },
          }
        );
      },
    });

    router.push('/image-editor');
  };

  const contentWidth = screenWidth * 0.9;

  const renderItem = ({ item }: { item: ViewerItem }) => {
    let content: React.ReactNode;
    switch (item.type) {
      case 'cover':
        content = (
          <CoverView
            album={album}
            eventToken={eventToken}
            width={contentWidth}
            isRTL={isRTL}
          />
        );
        break;
      case 'prolog':
      case 'epilog':
        content = (
          <EpilogPrologView data={item.data} width={contentWidth} />
        );
        break;
      case 'spread':
        content = (
          <SpreadView
            spread={spreads[item.index]}
            images={images}
            texts={texts}
            eventToken={eventToken}
            album={album}
            width={contentWidth}
            isRTL={isRTL}
            onImagePress={handleImagePress}
          />
        );
        break;
    }

    return (
      <View style={[styles.itemWrapper, { width: screenWidth }]}>
        {content}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        horizontal
        pagingEnabled
        inverted={isRTL}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      <Text style={styles.pageIndicator}>
        {currentIndex + 1} / {items.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.palette.neutral200,
  },
  itemWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicator: {
    ...theme.typography.caption,
    color: theme.colors.palette.neutral600,
    textAlign: 'center',
    paddingVertical: theme.spacing.sm,
  },
});
