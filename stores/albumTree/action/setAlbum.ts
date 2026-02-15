import { PhotoAlbum, TreeV5 } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import useLayoutTreeStore from '@/stores/layout';
import { trackError } from '@/utils/datadogErrorTracking';

type TreeV5WithoutCreationTime = Omit<TreeV5, 'm_creationTime'>;
type PhotoAlbumForState = Omit<PhotoAlbum, 'm_treeV5'> & {
  m_treeV5: TreeV5WithoutCreationTime;
};

// Fix folder IDs with value 0 in the spread folders array
const fixFolderIDs = (album: PhotoAlbum): PhotoAlbum => {
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) {
    return album;
  }

  const folders = album.m_treeV5.m_book_subtree.m_spread_folders;

  // Early return if no folders need fixing
  const hasZeroFolderIds = folders.some((folder) => folder.m_folderID === 0);
  if (!hasZeroFolderIds) {
    return album;
  }

  // Clone the album to avoid mutation
  const clonedAlbum = structuredClone(album);
  let nextFolderId = clonedAlbum.m_treeV5.m_book_subtree.m_next_folderID;

  // Only process folders that need fixing
  clonedAlbum.m_treeV5.m_book_subtree.m_spread_folders = folders.map(
    (folder) => {
      if (folder.m_folderID === 0) {
        return {
          ...folder,
          m_folderID: nextFolderId++,
        };
      }
      return folder;
    }
  );

  // Update the next folder ID
  clonedAlbum.m_treeV5.m_book_subtree.m_next_folderID = nextFolderId;

  return clonedAlbum;
};

const setLayouts = (album: PhotoAlbum | null, newAlbum: PhotoAlbum): void => {
  if (album?.m_treeV5?.m_album_token === newAlbum?.m_treeV5?.m_album_token) {
    return;
  }
  const layoutsSpread =
    newAlbum?.m_treeV5Resources.m_album_resources.m_layouts_for_album || [];
  const layoutsLayflat =
    newAlbum?.m_treeV5Resources.m_album_resources.m_layouts_for_album_Set2 ||
    [];
  useLayoutTreeStore.getState().setLayouts(layoutsSpread, layoutsLayflat);

  // Critical: Also update album resources to maintain consistency
  if (newAlbum?.m_treeV5Resources) {
    useLayoutTreeStore.getState().setAlbumResources(newAlbum.m_treeV5Resources);
  }
};

export const getSetAlbum: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['setAlbum']
> = (set, get) => (newAlbum: PhotoAlbum) => {
  try {
    const album = get().album;

    // Fix any folder IDs with value 0 before processing
    const fixedAlbum = fixFolderIDs(newAlbum);

    setLayouts(album, fixedAlbum);

    const albumTheme = fixedAlbum?.m_treeV5?.m_album_theme;

    // Create album copy without m_creationTime for undo/redo state, structuredClone to prevent reference equality check bug
    const albumForState: PhotoAlbumForState | PhotoAlbum = fixedAlbum?.m_treeV5
      ? (structuredClone({
          ...fixedAlbum,
          m_treeV5: {
            ...fixedAlbum.m_treeV5,
            m_creationTime: undefined,
          } as TreeV5WithoutCreationTime,
        }) as PhotoAlbumForState)
      : fixedAlbum;

    set({
      album: albumForState as PhotoAlbum,
      theme: albumTheme || get().theme,
    });

    // Initialize empty container tracking
    get().trackEmptyContainers();
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'setAlbum',
      albumToken: newAlbum?.m_treeV5?.m_album_token,
      albumName: newAlbum?.m_treeV5?.m_album_name,
    });
  }
};
