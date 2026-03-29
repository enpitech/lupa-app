import { theme } from '@/constants/theme';
import type { AlbumText, Folder, Image, PhotoAlbum } from '@/types/tree';
import { getTextForFolder } from '@/types/tree';
import {
  computeSlotPercentages,
  computeSlotPixelRect,
  isImageSlot,
  parseSizeString,
  type GhostSharedValues,
} from '@/utils/album-layout';
import { resolvePageBackground } from '@/utils/page-background';
import { resolvePageTextStyle, resolveTitleTextStyle } from '@/utils/tree-colors';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { DraggableImageSlot } from './draggable-image-slot';
import { TextSlot } from './text-slot';

type PageViewProps = {
  page: Folder;
  images: Image[];
  texts: AlbumText[];
  eventToken: string;
  album: PhotoAlbum;
  availableWidth: number;
  onImagePress?: (folderID: number) => void;
  // Drag coordination (owned by SpreadView)
  ghostSharedValues: GhostSharedValues;
  pageOffsetX: number;
  draggedFolderID: number | null;
  onDragStart: (folderID: number) => void;
  onDragEnd: (
    dropCenterX: number,
    dropCenterY: number,
    sourceFolderID: number
  ) => void;
  onDragCancel: () => void;
};

export function PageView({
  page,
  images,
  texts,
  eventToken,
  album,
  availableWidth,
  onImagePress,
  ghostSharedValues,
  pageOffsetX,
  draggedFolderID,
  onDragStart,
  onDragEnd,
  onDragCancel,
}: PageViewProps) {
  const { width: pageWidthPx, height: pageHeightPx } = parseSizeString(
    page.m_size
  );
  if (!pageWidthPx || !pageHeightPx) return null;

  const scaledHeight = (availableWidth * pageHeightPx) / pageWidthPx;

  const slotFolders = (page.m_child_folders ?? []).filter(
    Boolean
  ) as Folder[];

  const bg = resolvePageBackground(page, album, eventToken);

  const pageContent = (
    <>
      {slotFolders.map((slotFolder, index) => {
        const pct = computeSlotPercentages(
          slotFolder,
          pageWidthPx,
          pageHeightPx
        );

        if (!isImageSlot(slotFolder)) {
          const albumText = getTextForFolder(texts, slotFolder.m_folderID);
          if (!albumText) return null;

          const textStyle =
            slotFolder.m_type === 'TEXT_TYPE'
              ? resolvePageTextStyle(page, album)
              : resolveTitleTextStyle(slotFolder);

          return (
            <TextSlot
              key={`text-${slotFolder.m_folderID}-${index}`}
              leftPct={pct.leftPct}
              topPct={pct.topPct}
              widthPct={pct.widthPct}
              heightPct={pct.heightPct}
              albumText={albumText}
              scaledPageHeight={scaledHeight}
              pageHeightPx={pageHeightPx}
              style={textStyle}
            />
          );
        }

        const image = images.find(
          (img) => img.m_folderID === slotFolder.m_folderID
        );
        const pixelRect = computeSlotPixelRect(
          slotFolder,
          pageWidthPx,
          pageHeightPx,
          availableWidth,
          scaledHeight
        );

        return (
          <DraggableImageSlot
            key={`slot-${slotFolder.m_folderID}-${index}`}
            folderID={slotFolder.m_folderID}
            image={image}
            eventToken={eventToken}
            leftPct={pct.leftPct}
            topPct={pct.topPct}
            widthPct={pct.widthPct}
            heightPct={pct.heightPct}
            spreadSlotLeft={pageOffsetX + pixelRect.left}
            slotTop={pixelRect.top}
            slotWidth={pixelRect.width}
            slotHeight={pixelRect.height}
            ghost={ghostSharedValues}
            isDragSource={draggedFolderID === slotFolder.m_folderID}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
            onTap={onImagePress}
          />
        );
      })}
    </>
  );

  const pageStyle = [
    styles.page,
    {
      width: availableWidth,
      height: scaledHeight,
      backgroundColor: bg.color ?? theme.colors.background,
    },
  ];

  if (bg.imageUrl) {
    return (
      <ImageBackground
        source={{ uri: bg.imageUrl }}
        style={pageStyle}
        resizeMode="cover"
      >
        {pageContent}
      </ImageBackground>
    );
  }

  return <View style={pageStyle}>{pageContent}</View>;
}

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    overflow: 'hidden',
  },
});
