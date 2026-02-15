import { Folder, PhotoAlbum } from '@/types/tree';
import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { folderMtypeEnum } from '@/utils/appConst';
import { getPageNum, isLayflatFolder } from '@/lib/utils/albumUtils';

export interface EmptyContainerInfo {
  pageId: number;
  spreadIndex: number;
  containerLayoutId: number;
  containerType: string;
  pageNumbers: (number | null)[];
  isLayflat: boolean;
}

// Helper function to find spread index by page ID
export const findSpreadIndexByPageId = (
  spreadFolders: Folder[],
  pageId: number
): number => {
  return spreadFolders.findIndex((spread) =>
    spread.m_child_folders?.some((page) => page?.m_folderID === pageId)
  );
};

// Recursively scan a folder and its children for empty containers
const scanFolderForEmptyContainers = (
  folder: Folder,
  spreadIndex: number,
  emptyContainers: EmptyContainerInfo[],
  pageNumbers: (number | null)[],
  isLayflat: boolean,
  tImages: Set<number>
): void => {
  if (!folder) return;

  // Check if this folder is an empty container
  // A folder is considered empty if:
  // 1. It's explicitly marked as EMPTY_CONTAINER and not in tree images, OR
  // 2. It's IMAGE_TYPE but has no image assigned (folderID = 0), OR
  // 3. It's IMAGE_TYPE but the image is not in the tree images array
  if (
    ((folder.m_type === folderMtypeEnum.EMPTY_CONTAINER &&
      !tImages.has(folder.m_folderID)) ||
      (folder.m_type === folderMtypeEnum.IMAGE_TYPE &&
        (folder.m_folderID === 0 || !tImages.has(folder.m_folderID)))) &&
    folder.m_layoutID !== undefined
  ) {
    emptyContainers.push({
      pageId: folder.m_folderID,
      spreadIndex,
      containerLayoutId: folder.m_layoutID,
      containerType: folder.m_type,
      pageNumbers,
      isLayflat,
    });
  }

  // Recursively check child folders
  if (folder.m_child_folders && Array.isArray(folder.m_child_folders)) {
    folder.m_child_folders.forEach((child) => {
      if (child) {
        scanFolderForEmptyContainers(
          child,
          spreadIndex,
          emptyContainers,
          pageNumbers,
          isLayflat,
          tImages
        );
      }
    });
  }
};

// Scan book (non-cover) spreads for empty containers
const scanBookSpreadsForEmptyContainers = (
  album: PhotoAlbum,
  emptyContainersMap: Map<number, EmptyContainerInfo[]>
) => {
  const spreadFolders = album.m_treeV5.m_book_subtree.m_spread_folders;
  const tImages = new Set(
    album.m_treeV5.m_book_subtree.m_tree_tmages.map((img) => img.m_folderID)
  );
  const isProlog =
    spreadFolders[0]?.m_child_folders?.every((child) => child !== null) ??
    false;

  spreadFolders.forEach((spread, spreadIndex) => {
    if (!spread) return;

    const spreadEmptyContainers: EmptyContainerInfo[] = [];
    const isLayflat = isLayflatFolder(spread);

    let pageNumbers: (number | null)[] = [];
    if (isLayflat && spread.m_child_folders?.[0]) {
      const rightPageNum = getPageNum(
        album,
        spread.m_child_folders[0].m_folderID,
        isProlog
      );
      const leftPageNum = rightPageNum !== null ? rightPageNum + 1 : null;
      pageNumbers = [rightPageNum, leftPageNum];
    } else if (spread.m_child_folders) {
      pageNumbers = spread.m_child_folders
        .filter((child): child is Folder => child !== null)
        .map((child) => getPageNum(album, child.m_folderID, isProlog));
    }

    scanFolderForEmptyContainers(
      spread,
      spreadIndex,
      spreadEmptyContainers,
      pageNumbers,
      isLayflat,
      tImages
    );

    if (spreadEmptyContainers.length > 0) {
      const containersWithPageNumbers = spreadEmptyContainers.map(
        (container) => ({
          ...container,
          pageNumbers,
          isLayflat,
        })
      );
      emptyContainersMap.set(spreadIndex, containersWithPageNumbers);
    }
  });
};

// Scan cover spreads (index -1) for empty containers
const scanCoverSpreadsForEmptyContainers = (
  album: PhotoAlbum,
  emptyContainersMap: Map<number, EmptyContainerInfo[]>
) => {
  const coverSpreadFolders = album.m_treeV5?.m_cover_subtree?.m_spread_folders;
  if (!coverSpreadFolders || !coverSpreadFolders[0]) return;
  const coverTImages = new Set(
    album.m_treeV5?.m_cover_subtree?.m_tree_tmages?.map(
      (img) => img.m_folderID
    ) || []
  );

  const coverSpread = coverSpreadFolders[0];
  const coverEmptyContainers: EmptyContainerInfo[] = [];
  const isLayflat = false;
  const pageNumbers: (number | null)[] = [null];

  scanFolderForEmptyContainers(
    coverSpread,
    -1,
    coverEmptyContainers,
    pageNumbers,
    isLayflat,
    coverTImages
  );

  if (coverEmptyContainers.length > 0) {
    emptyContainersMap.set(-1, coverEmptyContainers);
  }
};

// Main scan function delegating to book and cover scanners
const scanAlbumForEmptyContainers = (
  album: PhotoAlbum | null
): Map<number, EmptyContainerInfo[]> => {
  const emptyContainersMap = new Map<number, EmptyContainerInfo[]>();
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) {
    return emptyContainersMap;
  }
  // Scan book spreads
  scanBookSpreadsForEmptyContainers(album, emptyContainersMap);
  // Scan cover spreads
  scanCoverSpreadsForEmptyContainers(album, emptyContainersMap);
  return emptyContainersMap;
};

export const getTrackEmptyContainersAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['trackEmptyContainers']
> = (set, get) => () => {
  const album = get().album;
  const emptyContainersMap = scanAlbumForEmptyContainers(album);
  set({ emptyContainersMap });
};

// Scan only the cover spreads (index -1) for empty containers
export const getTrackCoverEmptyContainersAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['trackCoverEmptyContainers']
> = (set, get) => () => {
  const album = get().album;
  if (!album) return;
  const emptyContainersMap = new Map(get().emptyContainersMap);
  // Remove previous cover entry, will be re-added if containers found
  emptyContainersMap.delete(-1);
  scanCoverSpreadsForEmptyContainers(album, emptyContainersMap);
  set({ emptyContainersMap });
};

// Scan only a specific spread for empty containers (incremental update)
export const getTrackSpreadEmptyContainersAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['trackSpreadEmptyContainers']
> = (set, get) => (spreadIndex: number) => {
  const album = get().album;
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) {
    return;
  }

  const spreadFolders = album.m_treeV5.m_book_subtree.m_spread_folders;
  const spread = spreadFolders[spreadIndex];

  if (!spread) {
    return;
  }

  const emptyContainersMap = new Map(get().emptyContainersMap);
  const spreadEmptyContainers: EmptyContainerInfo[] = [];
  const isLayflat = isLayflatFolder(spread);
  const tImages = new Set(
    album.m_treeV5.m_book_subtree.m_tree_tmages.map((img) => img.m_folderID)
  );

  const isProlog =
    spreadFolders[0]?.m_child_folders?.every((child) => child !== null) ??
    false;

  let pageNumbers: (number | null)[] = [];
  if (isLayflat && spread.m_child_folders?.[0]) {
    const rightPageNum = getPageNum(
      album,
      spread.m_child_folders[0].m_folderID,
      isProlog
    );
    const leftPageNum = rightPageNum !== null ? rightPageNum + 1 : null;
    pageNumbers = [rightPageNum, leftPageNum];
  } else if (spread.m_child_folders) {
    pageNumbers = spread.m_child_folders
      .filter((child): child is Folder => child !== null)
      .map((child) => getPageNum(album, child.m_folderID, isProlog));
  }

  scanFolderForEmptyContainers(
    spread,
    spreadIndex,
    spreadEmptyContainers,
    pageNumbers,
    isLayflat,
    tImages
  );
  if (spreadEmptyContainers.length > 0) {
    emptyContainersMap.set(spreadIndex, spreadEmptyContainers);
  } else {
    emptyContainersMap.delete(spreadIndex);
  }

  set({ emptyContainersMap });
};
