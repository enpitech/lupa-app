import { PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import {
  applyTextBoxProperties,
  detectLanguage,
  getDestinationFolder,
  getFontResources,
  setFontProperties,
} from '@/lib/TreeV5/utils/text';
import { getLayoutFamilyByLayoutId } from '@/lib/TreeV5/utils/layouts';
import { trackError } from '@/utils/datadogErrorTracking';

export const getAddTextToImageAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['addTextToImage']
> = (set, get) => (id: number, pageId: number, text: string) => {
  try {
    const album = get().album;
    if (!album) return;

    const updatedAlbum = applyTextToImage(album, id, pageId, text);
    set({ album: updatedAlbum });
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'addTextToImage',
      imageId: id,
      pageId,
      textLength: text.length,
      albumToken: get().album?.m_treeV5?.m_album_token,
    });
    throw error;
  }
};

function applyTextToImage(
  album: PhotoAlbum,
  imageId: number | string,
  pageId: number,
  text: string
): PhotoAlbum {
  if (!album) return album;
  const updatedAlbum: PhotoAlbum = structuredClone(album);

  const images = updatedAlbum?.m_treeV5?.m_book_subtree?.m_tree_tmages;
  if (!images) return album;

  const imageIndex = images.findIndex((img) => img.m_folderID === imageId);
  if (imageIndex === -1) return album;

  const fonts = getFontResources();
  const language = detectLanguage(text);

  const destinationFolder = getDestinationFolder(updatedAlbum, pageId);
  if (!destinationFolder) return album;

  // Check if this is a Magazine layout
  const layoutFamily = getLayoutFamilyByLayoutId(destinationFolder.m_layoutID);
  const isMagazineLayout = layoutFamily === 'MAGAZINE';

  setFontProperties(
    images,
    imageIndex,
    fonts,
    language,
    text,
    isMagazineLayout
  );

  applyTextBoxProperties(destinationFolder, imageId);

  return updatedAlbum;
}
