import {
  filterCoversByTheme,
  filterCoversByLayoutId,
} from '@/lib/TreeV5/utils/covers';
import { Folder, Image, PhotoAlbum, Text } from '@/types/tree';
import { create } from 'zustand';
import { QUERY_KEY } from '@/utils/appConst';
import { QueryClient } from '@tanstack/react-query';
import { trackError } from '@/utils/datadogErrorTracking';

interface AlbumTreeCoversState {
  covers: Folder[];
  images: Image[];
  texts: Text[];
  solidColorLayouts: Folder[];
  isNeedUpdate: boolean;
  selectedColor: string | null;
  isCoverFullView: boolean;
  setNeedUpdate: (isNeedUpdate: boolean) => void;
  setCovers: (album: PhotoAlbum) => void;
  setSelectedColor: (color: string | null) => void;
  setIsCoverFullView: (isCoverFullView: boolean) => void;
  refetchCovers: (queryClient: QueryClient) => void;
}

export const useAlbumTreeCovers = create<AlbumTreeCoversState>((set, get) => ({
  isNeedUpdate: false,
  covers: [],
  images: [],
  solidColorLayouts: [],
  selectedColor: null,
  setNeedUpdate: (isNeedUpdate: boolean) => set({ isNeedUpdate }),
  texts: [],
  isCoverFullView: false,
  setIsCoverFullView: (isCoverFullView: boolean) => set({ isCoverFullView }),
  setCovers: (album: PhotoAlbum) => {
    try {
      if (!album || !album.m_treeV5 || !album.m_treeV5.m_cover_subtree) {
        return;
      }
      const { selectedColor } = get();
      const covers = filterCoversByTheme(album, selectedColor || undefined);
      const solidColorLayouts = filterCoversByLayoutId(album);
      const images = album.m_treeV5.m_cover_subtree.m_tree_tmages || [];
      const texts = album.m_treeV5.m_cover_subtree.m_tree_texts || [];
      set({ covers, images, texts, solidColorLayouts });
    } catch (error) {
      trackError(error as Error, {
        errorType: 'store_error',
        store: 'cover',
        action: 'setCovers',
        albumToken: album?.m_treeV5?.m_album_token,
        selectedColor: get().selectedColor,
      });
    }
  },
  setSelectedColor: (color: string | null) => {
    set({ selectedColor: color });
  },
  refetchCovers: (queryClient: QueryClient) => {
    try {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.FETCH_BOOK_COVER],
        exact: false,
      });
    } catch (error) {
      trackError(error as Error, {
        errorType: 'store_error',
        store: 'cover',
        action: 'refetchCovers',
      });
    }
  },
}));
