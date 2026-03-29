import type { AlbumText, Folder, Image, PhotoAlbum } from '@/types/tree';
import {
  computeSlotPixelRect,
  findDropTarget,
  isImageSlot,
  parseSizeString,
  type GhostSharedValues,
  type SlotRect,
} from '@/utils/album-layout';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ImageContent } from './image-content';
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
  onImageSwap?: (folderIdA: number, folderIdB: number) => void;
};

/** Compute pixel rects for all image slots across all pages in the spread. */
function computeAllSlotRects(
  pages: Folder[],
  pageWidth: number,
  isRTL: boolean
): SlotRect[] {
  const orderedPages = isRTL ? [...pages].reverse() : pages;

  return orderedPages.flatMap((page, pageIndex) => {
    const pageSize = parseSizeString(page.m_size);
    if (!pageSize.width || !pageSize.height) return [];

    const scaledHeight = (pageWidth * pageSize.height) / pageSize.width;
    const pageOffsetX = pageIndex * pageWidth;

    const slotFolders = (page.m_child_folders ?? []).filter(
      Boolean
    ) as Folder[];

    return slotFolders
      .filter(isImageSlot)
      .map((slotFolder) =>
        computeSlotPixelRect(
          slotFolder,
          pageSize.width,
          pageSize.height,
          pageWidth,
          scaledHeight,
          pageOffsetX
        )
      );
  });
}

export function SpreadView({
  spread,
  images,
  texts,
  eventToken,
  album,
  width,
  isRTL,
  onImagePress,
  onImageSwap,
}: SpreadViewProps) {
  const pages = (spread.m_child_folders ?? []).filter(Boolean) as Folder[];
  const pageWidth = width / 2;
  const orderedPages = isRTL ? [...pages].reverse() : pages;

  // --- Drag coordination ---
  const [draggedFolderID, setDraggedFolderID] = useState<number | null>(null);

  const ghostSharedValues: GhostSharedValues = {
    ghostX: useSharedValue(0),
    ghostY: useSharedValue(0),
    ghostWidth: useSharedValue(0),
    ghostHeight: useSharedValue(0),
    ghostScale: useSharedValue(0),
    ghostOpacity: useSharedValue(0),
  };

  const allSlotRects = computeAllSlotRects(pages, pageWidth, isRTL);

  const handleDragStart = (folderID: number) => {
    setDraggedFolderID(folderID);
  };

  const handleDragEnd = (
    dropCenterX: number,
    dropCenterY: number,
    sourceFolderID: number
  ) => {
    const target = findDropTarget(
      allSlotRects,
      dropCenterX,
      dropCenterY,
      sourceFolderID
    );
    if (target) {
      onImageSwap?.(sourceFolderID, target.folderID);
    }
  };

  const handleDragCancel = () => {
    setDraggedFolderID(null);
  };

  const ghostStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: ghostSharedValues.ghostX.value,
    top: ghostSharedValues.ghostY.value,
    width: ghostSharedValues.ghostWidth.value,
    height: ghostSharedValues.ghostHeight.value,
    transform: [{ scale: ghostSharedValues.ghostScale.value }],
    opacity: ghostSharedValues.ghostOpacity.value,
    zIndex: 100,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  }));

  const draggedImage =
    draggedFolderID != null
      ? images.find((img) => img.m_folderID === draggedFolderID)
      : undefined;

  return (
    <View style={[styles.container, { width }]}>
      {orderedPages.map((page, pageIndex) => (
        <PageView
          key={`page-${spread.m_folderID}-${page.m_folderID}`}
          page={page}
          images={images}
          texts={texts}
          eventToken={eventToken}
          album={album}
          availableWidth={pageWidth}
          onImagePress={onImagePress}
          ghostSharedValues={ghostSharedValues}
          pageOffsetX={pageIndex * pageWidth}
          draggedFolderID={draggedFolderID}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        />
      ))}

      {/* Ghost overlay - renders above both pages */}
      <Animated.View style={ghostStyle} pointerEvents="none">
        {draggedImage && (
          <ImageContent image={draggedImage} eventToken={eventToken} />
        )}
      </Animated.View>
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
