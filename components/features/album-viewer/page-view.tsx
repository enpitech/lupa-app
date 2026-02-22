import { theme } from '@/constants/theme';
import { getBackgroundImageUrl } from '@/services/api/config';
import type { AlbumText, Folder, Image, PhotoAlbum } from '@/types/tree';
import { getTextForFolder } from '@/types/tree';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { ImageSlot } from './image-slot';
import { TextSlot } from './text-slot';

type PageViewProps = {
  page: Folder;
  images: Image[];
  texts: AlbumText[];
  eventToken: string;
  album: PhotoAlbum;
  availableWidth: number;
  onImagePress?: (folderID: number) => void;
};

function parseSizeString(size: string): { width: number; height: number } {
  const [w, h] = size.split(',').map(Number);
  return { width: w, height: h };
}

function getPageBackground(
  page: Folder,
  album: PhotoAlbum,
  eventToken: string
): { color?: string; imageUrl?: string } {
  const pictureId = page.m_background?.m_color_im_id;
  if (!pictureId) return {};

  if (pictureId.includes('#')) {
    return { color: pictureId.replace('#FF', '#') };
  }

  const tree = album.m_treeV5;
  const imageUrl = getBackgroundImageUrl({
    pictureId,
    albumToken: eventToken,
    albumTheme: tree.m_album_theme,
    format: tree.m_format,
    coverTheme: tree.m_cover_theme,
    coverFamily: tree.m_cover_family,
  });

  return { imageUrl };
}

export function PageView({
  page,
  images,
  texts,
  eventToken,
  album,
  availableWidth,
  onImagePress,
}: PageViewProps) {
  const { width: pageWidthPx, height: pageHeightPx } = parseSizeString(
    page.m_size
  );
  if (!pageWidthPx || !pageHeightPx) return null;

  const scaledHeight = (availableWidth * pageHeightPx) / pageWidthPx;

  const slotFolders = (page.m_child_folders ?? []).filter(
    Boolean
  ) as Folder[];

  const bg = getPageBackground(page, album, eventToken);

  const pageContent = (
    <>
      {slotFolders.map((slotFolder, index) => {
        const slotSize = parseSizeString(slotFolder.m_size);
        const pivotX = slotFolder.m_pivot.X;
        const pivotY = slotFolder.m_pivot.Y;

        const leftPct =
          ((pivotX - slotSize.width / 2) / pageWidthPx) * 100;
        const topPct =
          ((pivotY - slotSize.height / 2) / pageHeightPx) * 100;
        const widthPct = (slotSize.width / pageWidthPx) * 100;
        const heightPct = (slotSize.height / pageHeightPx) * 100;

        // TEXT_TYPE or TITLE_TYPE folders render text
        if (
          slotFolder.m_type === 'TEXT_TYPE' ||
          slotFolder.m_type === 'TITLE_TYPE'
        ) {
          const albumText = getTextForFolder(texts, slotFolder.m_folderID);
          if (!albumText) return null;

          return (
            <TextSlot
              key={`text-${slotFolder.m_folderID}-${index}`}
              leftPct={leftPct}
              topPct={topPct}
              widthPct={widthPct}
              heightPct={heightPct}
              albumText={albumText}
              scaledPageHeight={scaledHeight}
              pageHeightPx={pageHeightPx}
            />
          );
        }

        // IMAGE_TYPE and other folders render images
        const image = images.find(
          (img) => img.m_folderID === slotFolder.m_folderID
        );

        return (
          <ImageSlot
            key={`slot-${slotFolder.m_folderID}-${index}`}
            leftPct={leftPct}
            topPct={topPct}
            widthPct={widthPct}
            heightPct={heightPct}
            image={image}
            eventToken={eventToken}
            onPress={
              onImagePress
                ? () => onImagePress(slotFolder.m_folderID)
                : undefined
            }
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
