import { create } from 'zustand';
import { getChangeImageByLayoutAction } from './action/changeImageByLayout';
import { PinturaImageState } from '@pqina/pintura';
import { Folder, Image, PhotoAlbum } from '@/types/tree';
import { createJSONStorage, persist, subscribeWithSelector } from 'zustand/middleware';
import { getSwapImagesAction } from './action/swapImages';
import { DragEndEvent } from '@dnd-kit/core';
import { getSwapPagesAction } from './action/swapPages';
import { getSetAlbum } from './action/setAlbum';
import { getShuffleLayoutAction } from './action/shuffleLayout';
import { getChangePageLayoutByLayoutIdAction } from './action/changePageLayoutByLayoutId';
import { getAddTextToImageAction } from './action/addTextToImage';
import { getAddImageToPageAction } from './action/addImageToPage';
import { getRemoveImagesFromTreeAction } from './action/removeImagesFromTree';
import { getChangeCoverLayout } from './action/changeCoverLayout';
import { getAddPage, AddPageOptions } from './action/addPage';
import { getAddPageTitleAction } from './action/addPageTitle';
import { getRemovePageTitleAction } from './action/removePageTitle';
import { temporal } from 'zundo';
import isDeepEqual from 'fast-deep-equal';
import type { SetStateAction, Dispatch } from 'react';
import { getDeleteFromBasketAction } from './action/deleteFromBasket';
import { getRenameAlbumAction } from './action/renameAlbum';
import { usePageMemoryStore } from '@/stores/pageMemory';
import { getFolderData } from '@/utils/editor/getFolderData';
import { PagesData } from '@/types/editor';
import {
  getTrackEmptyContainersAction,
  getTrackSpreadEmptyContainersAction,
  EmptyContainerInfo,
  getTrackCoverEmptyContainersAction,
} from './action/emptyContainerTracking';
import useAlbumStore from '@/stores/album';
import { Album, ImageData } from '@/stores/album/types';
import { trackError } from '@/utils/datadogErrorTracking';
import { deleteImage } from '@/services/api/deleteImage';
import { hasValidDimensions } from '@/utils/imageValidation';

export interface RemovedInvalidImage {
  uniqueId: number;
  imageName: string;
  reason: 'invalid_dimensions' | 'missing_album_data';
}

type ShouldSkipAnimationArgs = {
  albumTree: PhotoAlbum | null;
  albumToken: string;
  currentPageIndex: number;
  movingPageForward?: boolean;
  movingPageBackward?: boolean;
};

const shouldSkipAnimation = ({
  albumTree,
  albumToken,
  currentPageIndex,
  movingPageForward,
  movingPageBackward,
}: ShouldSkipAnimationArgs) => {
  const editorPageWidth = 0; // page dimensions are irrelevant here.
  const maxPageHeight = 0; // page dimensions are irrelevant here.

  if (currentPageIndex === -1) {
    return { skip: true };
  }

  const folderData = getFolderData({
    albumTree,
    albumToken,
    folderIndex: currentPageIndex,
    editorPageWidth,
    maxPageHeight,
  });

  if (!folderData) {
    return { skip: true };
  }

  const { elementsData } = folderData;

  const hasMissingChild =
    elementsData?.find((child) => {
      return child === null;
    }) === null;

  if (hasMissingChild) {
    return { skip: true };
  }

  if (movingPageForward) {
    const availablePages =
      albumTree?.m_treeV5?.m_book_subtree?.m_spread_folders?.length;
    if (availablePages && currentPageIndex >= availablePages - 2) {
      return { skip: true };
    }

    const folderData = getFolderData({
      albumTree,
      albumToken,
      folderIndex: currentPageIndex + 1,
      editorPageWidth,
      maxPageHeight,
    });

    if (!folderData) {
      return { skip: true };
    }

    const { elementsData: nextElementsData } = folderData;

    const hasEmptyChild = !!nextElementsData.find((child) => {
      return child.id === -1;
    });

    if (hasEmptyChild) {
      return { skip: false, nextPageData: nextElementsData };
    }
  } else if (movingPageBackward) {
    // Skip animation for first two pages (0, 1) when moving backward
    if (currentPageIndex <= 1) {
      return { skip: true };
    }

    const folderData = getFolderData({
      albumTree,
      albumToken,
      folderIndex: currentPageIndex - 1,
      editorPageWidth,
      maxPageHeight,
    });

    if (!folderData) {
      return { skip: true };
    }

    const { elementsData: previousElementsData } = folderData;

    const hasEmptyChild = !!previousElementsData.find((child) => {
      return child.id === -1;
    });

    if (hasEmptyChild) {
      return { skip: false, nextPageData: previousElementsData };
    }
  }

  return { skip: false };
};

type EditorFields = {
  currentPageIndex: number;
  currentPageInFolder?: number;
  totalPages: number;
  totalSpreads: number;
  isExpanded: boolean;
  isLayflat: boolean;
  isVisible: boolean;
  isPreview: boolean;
  selectedItemId: number | null;
  currentFolderImagesNum?: number;
  folderByPageId: Folder | null;
  theme?: string;
  isThemeEditPending: boolean;
  isInSaveProcess: boolean;
  isInAutoSaveProcess: boolean;
  album: PhotoAlbum | null;
  m_creationTime: string | null;
  maxPages: number | null;
  activeSidebarSectionIndex: number;
  isProcessingAddToBasket: boolean;
  isNeedUpdateCover: boolean;
  snapshotMode: boolean;
  emptyContainersMap: Map<number, EmptyContainerInfo[]>;
  scrollToPageIndex: number | undefined;
  removedInvalidImages: RemovedInvalidImage[] | null;
};

type EditorActions = {
  setCurrentPageIndex: (index: number) => void;
  setCurrentPageInFolder: Dispatch<SetStateAction<number | undefined>>;
  setTotalPages: (total: number) => void;
  setTotalSpreads: (total: number) => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsLayflat: (layflat: boolean) => void;
  setIsVisible: (visible: boolean) => void;
  setIsPreview: (preview: boolean) => void;
  setSelectedItemId: (id: number | null) => void;
  setCurrentFolderImagesNum: (num?: number) => void;
  handleRemoveImageCurrentFolderImagesNum: () => void;
  setFolderByPageId: (folder: Folder | null) => void;
  setTheme: (theme?: string) => void;
  setIsThemeEditPending: (pending: boolean) => void;
  setIsInSaveProcess: (loading: boolean) => void;
  setIsInAutoSaveProcess: (loading: boolean) => void;
  setActiveSidebarSectionIndex: (index: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetEditorState: () => void;
  clearAlbumData: () => void;
  changeCoverLayout: (cover: Folder) => void;
  addPageTitle: (pageId: number, title: string) => void;
  removePageTitle: (pageId: number) => void;
  addTextToImage: (id: number, pageId: number, text: string) => void;
  addImageToPage: (event: DragEndEvent) => void;
  removeImagesFromTree: (
    id: number,
    pageId: number,
    imageIds: number[],
    isRemoveImageFromTreeImages?: boolean | true
  ) => void;
  setAlbum: (album: PhotoAlbum) => void;
  changeImageByLayout: (
    id: number | string,
    imageState: PinturaImageState
  ) => void;
  swapImages: (event: DragEndEvent) => void;
  swapPages: (event: DragEndEvent) => void;
  shuffleLayout: (id: number, pageId: number, isLayflat: boolean) => void;
  addPage: (options?: AddPageOptions) => void;
  changePageLayoutByLayoutId: (
    id: number,
    destLayoutId: number,
    pageId: number,
    imageId?: number
  ) => void;
  imagesToReset: number[];
  setImagesToReset: (ids: number[]) => void;
  removeImageFromReset: (id: number) => void;
  updateTreeCreationTime: (creationTime: string) => void;
  getTreeWithCreationTime: () => PhotoAlbum | null;
  setMaxPages: (maxPages: number) => void;
  getCoverDirection: () => string;
  deleteFromBasket: (eventToken: string) => Promise<void>;
  renameAlbum: (newName: string) => void;
  setProcessingAddToBasket: (isProcessing: boolean) => void;
  updateAlbumAndClearHistory: (album: PhotoAlbum) => void;
  setSnapshotMode: (snapshotMode: boolean) => void;
  shouldSkipPageFlipAnimation: (args: {
    movingPageForward?: boolean;
    movingPageBackward?: boolean;
  }) => { skip: boolean; nextPageData?: PagesData[] };
  skipFlipAnimation: boolean;
  nextPageData: PagesData[];
  movingPageForward: boolean;
  movingPageBackward: boolean;
  trackEmptyContainers: () => void;
  trackSpreadEmptyContainers: (spreadIndex: number) => void;

  removeEmptyContainerFromPage: (
    spreadIndex: number,
    containerLayoutId?: number
  ) => void;
  trackCoverEmptyContainers: () => void;
  setScrollToPageIndex: (index: number | undefined) => void;
  validateAndCleanTreeImages: (albumStoreData: Album) => void;
  clearRemovedInvalidImages: () => void;
};
export type AlbumTreeStore = EditorFields & EditorActions;
const initialState: AlbumTreeStore = {
  album: null as PhotoAlbum | null,
  currentPageIndex: -1,
  currentPageInFolder: undefined as number | undefined,
  totalPages: 0,
  totalSpreads: 0,
  isExpanded: false,
  isLayflat: false,
  isVisible: true,
  isPreview: false,
  selectedItemId: null as number | null,
  currentFolderImagesNum: undefined as number | undefined,
  folderByPageId: null as Folder | null,
  theme: undefined as string | undefined,
  isThemeEditPending: false,
  isInSaveProcess: false,
  isInAutoSaveProcess: false,
  m_creationTime: null as string | null,
  activeSidebarSectionIndex: -1,
  maxPages: null,
  isProcessingAddToBasket: false,
  isNeedUpdateCover: false,
  snapshotMode: false,
  emptyContainersMap: new Map(),
  scrollToPageIndex: undefined as number | undefined,
  removedInvalidImages: null as RemovedInvalidImage[] | null,
  setAlbum: () => {},
  changeImageByLayout: () => {},
  swapImages: () => {},
  swapPages: () => {},
  shuffleLayout: () => {},
  addPage: () => {},
  changePageLayoutByLayoutId: () => {},
  addTextToImage: () => {},
  addImageToPage: () => {},
  removeImagesFromTree: () => {},
  changeCoverLayout: () => {},
  addPageTitle: () => {},
  removePageTitle: () => {},
  setCurrentPageIndex: () => {},
  setCurrentPageInFolder: () => {},
  setTotalPages: () => {},
  setTotalSpreads: () => {},
  setIsExpanded: () => {},
  setIsLayflat: () => {},
  setIsVisible: () => {},
  setIsPreview: () => {},
  setSelectedItemId: () => {},
  setCurrentFolderImagesNum: () => {},
  handleRemoveImageCurrentFolderImagesNum: () => {},
  setFolderByPageId: () => {},
  setTheme: () => {},
  setActiveSidebarSectionIndex: () => {},
  setIsThemeEditPending: () => {},
  setIsInSaveProcess: () => {},
  setIsInAutoSaveProcess: () => {},
  nextPage: () => {},
  prevPage: () => {},
  resetEditorState: () => {},
  clearAlbumData: () => {},
  setImagesToReset: () => {},
  imagesToReset: [],
  removeImageFromReset: () => {},
  updateTreeCreationTime: () => {},
  getTreeWithCreationTime: () => null,
  setMaxPages: () => {},
  getCoverDirection: () => 'RTL',
  deleteFromBasket: () => Promise.resolve(),
  renameAlbum: () => {},
  setProcessingAddToBasket: () => {},
  updateAlbumAndClearHistory: () => {},
  shouldSkipPageFlipAnimation: () => ({ skip: false }),
  setSnapshotMode: () => {},
  skipFlipAnimation: false,
  nextPageData: [],
  movingPageForward: false,
  movingPageBackward: false,
  trackEmptyContainers: () => {},
  trackSpreadEmptyContainers: () => {},
  removeEmptyContainerFromPage: () => {},
  trackCoverEmptyContainers: () => {},
  setScrollToPageIndex: () => {},
  validateAndCleanTreeImages: () => {},
  clearRemovedInvalidImages: () => {},
};

type AlbumSyncKey = 'name' | 'skin' | 'cover_name';

type AlbumSyncField<K extends AlbumSyncKey = AlbumSyncKey> = {
  albumKey: K;
  getValue: (tree: PhotoAlbum['m_treeV5']) => Album[K] | undefined;
};

const albumSyncConfig: AlbumSyncField[] = [
  { albumKey: 'name', getValue: (tree) => tree.m_album_name },
  { albumKey: 'skin', getValue: (tree) => tree.m_album_theme },
  { albumKey: 'cover_name', getValue: (tree) => tree.m_cover_theme },
];

const syncAlbumStoreFromTree = (treeAlbum: PhotoAlbum | null) => {
  if (!treeAlbum?.m_treeV5) return;

  const albumStore = useAlbumStore.getState().album;
  if (!albumStore) return;

  const updates: Partial<Album> = {};

  albumSyncConfig.forEach(({ albumKey, getValue }) => {
    const nextValue = getValue(treeAlbum.m_treeV5);
    if (typeof nextValue === 'undefined') return;

    if (albumStore[albumKey] !== nextValue) {
      updates[albumKey] = nextValue as Album[typeof albumKey];
    }
  });

  if (Object.keys(updates).length > 0) {
    useAlbumStore.setState({
      album: {
        ...albumStore,
        ...updates,
      },
    });
  }
};

const useAlbumTreeStore = create<AlbumTreeStore>()(
  subscribeWithSelector(
    temporal(
      persist(
      (set, get, store) => ({
        ...initialState,
        setAlbum: getSetAlbum(set, get, store),
        changeImageByLayout: getChangeImageByLayoutAction(set, get, store),
        swapImages: getSwapImagesAction(set, get, store),
        swapPages: getSwapPagesAction(set, get, store),
        shuffleLayout: getShuffleLayoutAction(set, get, store),
        changePageLayoutByLayoutId: getChangePageLayoutByLayoutIdAction(
          set,
          get,
          store
        ),
        addPage: getAddPage(set, get, store),
        changeCoverLayout: getChangeCoverLayout(set, get, store),
        addTextToImage: getAddTextToImageAction(set, get, store),
        addImageToPage: getAddImageToPageAction(set, get, store),
        removeImagesFromTree: getRemoveImagesFromTreeAction(set, get, store),
        addPageTitle: getAddPageTitleAction(set, get, store),
        removePageTitle: getRemovePageTitleAction(set, get, store),
        deleteFromBasket: getDeleteFromBasketAction(set, get, store),
        renameAlbum: getRenameAlbumAction(set, get, store),
        trackEmptyContainers: getTrackEmptyContainersAction(set, get, store),
        trackSpreadEmptyContainers: getTrackSpreadEmptyContainersAction(
          set,
          get,
          store
        ),
        trackCoverEmptyContainers: getTrackCoverEmptyContainersAction(
          set,
          get,
          store
        ),

        setProcessingAddToBasket: (isProcessing: boolean) =>
          set({ isProcessingAddToBasket: isProcessing }),
        setSnapshotMode: (snapshotMode: boolean) => set({ snapshotMode }),

        updateAlbumAndClearHistory: (album: PhotoAlbum) => {
          const setAlbum = get().setAlbum;
          setAlbum(album);
          set({ m_creationTime: album.m_treeV5.m_creationTime });
          const clear = useAlbumTreeStore.temporal.getState().clear;
          clear();
        },

        getCoverDirection: () => {
          const album = get().album;
          return album?.m_treeV5.m_album_direction || 'LTR';
        },

        // Editor actions
        setCurrentPageIndex: (index) => {
          set({ currentPageIndex: index });

          // Start session on page change
          const pageMemoryStore = usePageMemoryStore.getState();
          pageMemoryStore.startSession();
        },
        setCurrentPageInFolder: (value) => {
          const newValue =
            typeof value === 'function'
              ? value(get().currentPageInFolder)
              : value;
          set({ currentPageInFolder: newValue });
        },

        setMaxPages: (maxPages) => set({ maxPages }),
        setTotalPages: (total) => set({ totalPages: total }),
        setTotalSpreads: (total) => set({ totalSpreads: total }),
        setIsExpanded: (expanded) => set({ isExpanded: expanded }),
        setIsLayflat: (layflat) => set({ isLayflat: layflat }),
        setIsVisible: (visible) => set({ isVisible: visible }),
        setIsPreview: (preview) => set({ isPreview: preview }),
        setSelectedItemId: (id) => set({ selectedItemId: id }),
        setCurrentFolderImagesNum: (num) =>
          set({ currentFolderImagesNum: num }),
        handleRemoveImageCurrentFolderImagesNum: () => {
          const { currentFolderImagesNum } = get();
          if (currentFolderImagesNum) {
            set({ currentFolderImagesNum: currentFolderImagesNum - 1 });
          }
        },
        setFolderByPageId: (folder) => set({ folderByPageId: folder }),
        setTheme: (theme) => set({ theme }),
        setIsThemeEditPending: (pending) =>
          set({ isThemeEditPending: pending }),
        setIsInSaveProcess: (loading) => set({ isInSaveProcess: loading }),
        setIsInAutoSaveProcess: (loading) =>
          set({ isInAutoSaveProcess: loading }),
        setActiveSidebarSectionIndex: (index) =>
          set({ activeSidebarSectionIndex: index }),
        setScrollToPageIndex: (index) => set({ scrollToPageIndex: index }),

        setImagesToReset: (ids: number[]) => set({ imagesToReset: ids }),
        removeImageFromReset: (id: number) =>
          set({ imagesToReset: get().imagesToReset.filter((i) => i !== id) }),
        shouldSkipPageFlipAnimation: ({
          movingPageForward,
          movingPageBackward,
        }: {
          movingPageForward?: boolean;
          movingPageBackward?: boolean;
        }) => {
          const state = get();
          const { album: albumTree, currentPageIndex } = state;
          const albumToken = albumTree?.m_treeV5.m_album_token || '';

          return shouldSkipAnimation({
            albumTree,
            albumToken,
            currentPageIndex,
            movingPageForward,
            movingPageBackward,
          });
        },
        nextPage: () => {
          const state = get();
          if (state.movingPageForward || state.movingPageBackward) {
            return;
          }

          const { skip: skipFlipAnimation, nextPageData = [] } =
            state.shouldSkipPageFlipAnimation({
              movingPageForward: true,
            });

          set({ movingPageForward: true, skipFlipAnimation, nextPageData });
          setTimeout(
            () => {
              const latestState = get();
              if (latestState.currentPageIndex < latestState.totalSpreads) {
                set({
                  currentPageIndex: latestState.currentPageIndex + 1,
                  currentPageInFolder: undefined,
                });

                // Start session on page navigation
                const pageMemoryStore = usePageMemoryStore.getState();
                pageMemoryStore.startSession();
              }
              set({ movingPageForward: false, nextPageData: [] });
            },
            !skipFlipAnimation ? 1000 : 0
          );
        },
        prevPage: () => {
          const state = get();
          if (state.movingPageBackward || state.movingPageForward) {
            return;
          }

          const { skip: skipFlipAnimation, nextPageData = [] } =
            state.shouldSkipPageFlipAnimation({
              movingPageBackward: true,
            });

          set({ movingPageBackward: true, skipFlipAnimation, nextPageData });
          setTimeout(
            () => {
              const latestState = get();
              if (latestState.currentPageIndex > -1) {
                set({
                  currentPageIndex: latestState.currentPageIndex - 1,
                  currentPageInFolder: undefined,
                });

                // Start session on page navigation
                const pageMemoryStore = usePageMemoryStore.getState();
                pageMemoryStore.startSession();
              }
              set({ movingPageBackward: false, nextPageData: [] });
            },
            !skipFlipAnimation ? 1000 : 0
          );
        },
        resetEditorState: () => {
          const { album, ...editorState } = initialState;
          console.log('resetting album', album?.m_version);
          set(editorState);
        },
        clearAlbumData: () => {
          set({
            album: null,
            m_creationTime: null,
            totalPages: 0,
            totalSpreads: 0,
          });
        },
        updateTreeCreationTime: (creationTime: string) => {
          set({ m_creationTime: creationTime });
        },
        getTreeWithCreationTime: () => {
          const state = get();
          if (state.album && state.album.m_treeV5 && state.m_creationTime) {
            return {
              ...state.album,
              m_treeV5: {
                ...state.album.m_treeV5,
                m_creationTime: state.m_creationTime,
              },
            };
          }
          return state.album;
        },

        clearRemovedInvalidImages: () => {
          set({ removedInvalidImages: null });
        },

        validateAndCleanTreeImages: (albumStoreData: Album) => {
          const state = get();
          const album = state.album;

          if (!album?.m_treeV5?.m_book_subtree?.m_tree_tmages) {
            return;
          }

          const treeImages = album.m_treeV5.m_book_subtree.m_tree_tmages;
          const albumImages = albumStoreData?.img_arr || [];

          const getInvalidReason = (
            _treeImage: Image,
            albumImage: ImageData | undefined
          ): RemovedInvalidImage['reason'] | null => {
            if (!albumImage) {
              return 'missing_album_data';
            }

            if (!hasValidDimensions(albumImage)) {
              return 'invalid_dimensions';
            }

            return null;
          };

          const removedImages: RemovedInvalidImage[] = [];
          const validTreeImages: Image[] = [];

          for (const treeImage of treeImages) {
            const albumImage = albumImages.find(
              (img) => img.uniqueId === treeImage.m_unique_id
            );
            const invalidReason = getInvalidReason(treeImage, albumImage);

            if (invalidReason) {
              removedImages.push({
                uniqueId: treeImage.m_unique_id,
                imageName: treeImage.m_image_name,
                reason: invalidReason,
              });
            } else {
              validTreeImages.push(treeImage);
            }
          }

          if (removedImages.length === 0) {
            return;
          }

          // Track to Datadog
          trackError(new Error('Removed invalid images from tree'), {
            errorType: 'data_sanitization',
            store: 'albumTree',
            action: 'validateAndCleanTreeImages',
            invalidCount: removedImages.length,
            imageNames: removedImages.map((img) => img.imageName).join(','),
            reasons: removedImages.map((img) => img.reason).join(','),
          });

          // Delete from backend
          const eventToken =
            albumStoreData?.event_token || album?.m_treeV5?.m_album_token || '';
          if (eventToken) {
            for (const removedImage of removedImages) {
              if (removedImage.imageName) {
                deleteImage({
                  eventToken,
                  image_name: removedImage.imageName,
                }).catch((error) => {
                  trackError(error as Error, {
                    errorType: 'api_error',
                    action: 'deleteInvalidImage',
                    imageName: removedImage.imageName,
                    eventToken,
                  });
                });
              }
            }
          }

          // Update tree with valid images only
          const updatedAlbum = structuredClone(album);
          updatedAlbum.m_treeV5.m_book_subtree.m_tree_tmages = validTreeImages;

          set({
            album: updatedAlbum,
            removedInvalidImages: removedImages,
          });
        },
      }),
      {
        name: 'photo-album-storage',
        partialize: (state) => ({
          album: state.album,
          m_creationTime: state.m_creationTime,
          // Optionally persist some editor state like currentPageIndex
          currentPageIndex: state.currentPageIndex,
        }),
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => () => {
          const clear = useAlbumTreeStore.temporal.getState().clear;
          clear();
        },
      }
    ),
    {
      limit: 50,
      partialize: (state) => ({ album: state.album }),
      equality: (prev, next) => {
        // structuredClone in setAlbum ensures we never have reference equality issues
        const prevFolders = prev.album?.m_treeV5?.m_book_subtree ?? [];
        const nextFolders = next.album?.m_treeV5?.m_book_subtree ?? [];
        return isDeepEqual(prevFolders, nextFolders);
      },
    }
    )
  )
);

export default useAlbumTreeStore;

// Keep album metadata in useAlbumStore synced with local tree changes so UI using
// album store data reflects live edits without waiting for a save.
useAlbumTreeStore.subscribe(
  (state) => state.album,
  (album) => syncAlbumStoreFromTree(album)
);
