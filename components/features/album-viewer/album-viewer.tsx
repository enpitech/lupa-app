import { FloatingButton } from '@/components/ui/floating-button';
import { queryKeys } from '@/constants/query-keys';
import { theme } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useUpdateTree } from '@/hooks/use-update-tree';
import { getImageUrl } from '@/services/api/config';
import type { EpilogPrologData } from '@/services/api/fetch-epilog-prolog';
import { useImageEditorStore } from '@/stores/image-editor';
import type { PhotoAlbum } from '@/types/tree';
import { getImages, getSpreadFolders, getTexts } from '@/types/tree';
import { applyPinturaStateToImage } from '@/utils/image-orientation';
import { toast } from '@backpackapp-io/react-native-toast';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackCoverView } from './back-cover-view';
import { CoverView } from './cover-view';
import { EpilogPrologView } from './epilog-prolog-view';
import { SpreadRenderer } from './spread-renderer';
import { SpreadView } from './spread-view';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewerItem =
  | { type: 'cover' }
  | { type: 'prolog'; data: EpilogPrologData }
  | { type: 'spread'; index: number }
  | { type: 'epilog'; data: EpilogPrologData }
  | { type: 'back-cover' };

type AlbumViewerProps = {
  album: PhotoAlbum;
  eventToken: string;
  prologData?: EpilogPrologData | null;
  epilogData?: EpilogPrologData | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasSectionText(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const text = (value as { text?: unknown }).text;
  return typeof text === 'string' && text.trim().length > 0;
}

function hasEpilogPrologContent(data?: EpilogPrologData | null): boolean {
  if (!data) return false;

  if ('text_str' in data) {
    return data.text_str.trim().length > 0;
  }

  return (
    hasSectionText(data.title) ||
    hasSectionText(data.header) ||
    hasSectionText(data.body) ||
    hasSectionText(data.footer)
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AlbumViewer({
  album,
  eventToken,
  prologData,
  epilogData,
}: AlbumViewerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const queryClient = useQueryClient();
  const updateTree = useUpdateTree({ eventToken });

  const spreads = getSpreadFolders(album);
  const images = getImages(album);
  const texts = getTexts(album);
  const isRTL = album.m_treeV5.m_album_direction === 'RTL';
  const contentWidth = screenWidth * 0.9;

  // -- Viewer items ---------------------------------------------------------

  const items: ViewerItem[] = [];
  items.push({ type: 'cover' });
  if (prologData && hasEpilogPrologContent(prologData)) {
    items.push({ type: 'prolog', data: prologData });
  }
  spreads.forEach((_, index) => {
    items.push({ type: 'spread', index });
  });
  if (epilogData && hasEpilogPrologContent(epilogData)) {
    items.push({ type: 'epilog', data: epilogData });
  }
  items.push({ type: 'back-cover' });

  // -- Navigation -----------------------------------------------------------

  const canGoForward = currentIndex < items.length - 1;
  const canGoBackward = currentIndex > 0;

  const goForward = () => canGoForward && setCurrentIndex(currentIndex + 1);
  const goBackward = () => canGoBackward && setCurrentIndex(currentIndex - 1);

  // -- Image editing --------------------------------------------------------

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

        queryClient.setQueryData(
          queryKeys.albums.tree(eventToken),
          updatedAlbum
        );

        updateTree.mutate(
          { album: updatedAlbum },
          {
            onSuccess: () => toast.success(t('imageEditor.saveSuccess')),
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

  // -- Image swapping -------------------------------------------------------

  const handleImageSwap = (folderIdA: number, folderIdB: number) => {
    const currentAlbum =
      queryClient.getQueryData<PhotoAlbum>(
        queryKeys.albums.tree(eventToken)
      ) ?? album;
    const currentImages = getImages(currentAlbum);

    const imageA = currentImages.find((img) => img.m_folderID === folderIdA);
    const imageB = currentImages.find((img) => img.m_folderID === folderIdB);
    if (!imageA || !imageB) return;

    const updatedImages = currentImages.map((img) => {
      if (img.m_folderID === folderIdA) return { ...imageB, m_folderID: folderIdA };
      if (img.m_folderID === folderIdB) return { ...imageA, m_folderID: folderIdB };
      return img;
    });

    const updatedAlbum: PhotoAlbum = {
      ...currentAlbum,
      m_treeV5: {
        ...currentAlbum.m_treeV5,
        m_book_subtree: {
          ...currentAlbum.m_treeV5.m_book_subtree,
          m_tree_tmages: updatedImages,
        },
      },
    };

    queryClient.setQueryData(
      queryKeys.albums.tree(eventToken),
      updatedAlbum
    );

    updateTree.mutate(
      { album: updatedAlbum },
      {
        onError: (error) => {
          console.error('[AlbumViewer] Swap save failed:', error);
          toast.error(t('imageEditor.saveError'));
          queryClient.invalidateQueries({
            queryKey: queryKeys.albums.tree(eventToken),
          });
        },
      }
    );
  };

  // -- Render item ----------------------------------------------------------

  const renderItem = (index: number) => {
    const item = items[index];
    switch (item.type) {
      case 'cover':
        return (
          <CoverView
            album={album}
            eventToken={eventToken}
            width={contentWidth}
            isRTL={isRTL}
          />
        );
      case 'prolog':
      case 'epilog':
        return (
          <EpilogPrologView
            data={item.data}
            album={album}
            eventToken={eventToken}
            width={contentWidth}
          />
        );
      case 'back-cover':
        return (
          <BackCoverView album={album} width={contentWidth} isRTL={isRTL} />
        );
      case 'spread':
        return (
          <SpreadView
            spread={spreads[item.index]}
            images={images}
            texts={texts}
            eventToken={eventToken}
            album={album}
            width={contentWidth}
            isRTL={isRTL}
            onImagePress={handleImagePress}
            onImageSwap={handleImageSwap}
          />
        );
    }
  };

  // -- Layout ---------------------------------------------------------------

  return (
    <View style={styles.screen}>
      {/* Spread content — fills the screen */}
      <SpreadRenderer
        currentIndex={currentIndex}
        screenWidth={screenWidth}
        renderItem={renderItem}
      />

      {/* Floating overlay controls */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            paddingTop: insets.top + theme.spacing.sm,
            paddingBottom: insets.bottom + theme.spacing.sm,
            paddingLeft: insets.left + theme.spacing.md,
            paddingRight: insets.right + theme.spacing.md,
          },
        ]}
        pointerEvents="box-none"
      >

        {/* Top bar: back button + page indicator */}
        <View style={styles.topBar} pointerEvents="box-none">
          <FloatingButton icon="chevron-back" onPress={() => router.back()} />

          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorText}>
              {currentIndex + 1} / {items.length}
            </Text>
          </View>
        </View>

        {/* Side arrows: vertically centered on left/right edges */}
        <View style={styles.sideArrows} pointerEvents="box-none">
          <FloatingButton
            icon="chevron-back"
            onPress={isRTL ? goForward : goBackward}
            disabled={isRTL ? !canGoForward : !canGoBackward}
          />
          <FloatingButton
            icon="chevron-forward"
            onPress={isRTL ? goBackward : goForward}
            disabled={isRTL ? !canGoBackward : !canGoForward}
          />
        </View>

      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.palette.neutral200,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
  },
  pageIndicatorText: {
    ...theme.typography.caption,
    color: theme.colors.palette.neutral600,
  },
  sideArrows: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
