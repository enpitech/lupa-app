import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { removePageTitle } from '@/lib/TreeV5/utils/text';
import { trackError } from '@/utils/datadogErrorTracking';

export const getRemovePageTitleAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['removePageTitle']
> = (set, get) => (pageId: number) => {
  try {
    const album = get().album;
    if (!album) return;

    const updatedAlbum = removePageTitle(album, pageId);
    set({ album: updatedAlbum });
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'removePageTitle',
      pageId,
      albumToken: get().album?.m_treeV5?.m_album_token,
    });
  }
};
