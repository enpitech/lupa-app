import { useEffect, useMemo, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { PhotoAlbum, Folder } from '@/types/tree';
import { useMultiPageEditorDnd } from './useMultiPageEditor';
import useAlbumTreeStore from '@/stores/albumTree';
import useLayoutTreeStore from '@/stores/layout';
import { DROP_BUTTON_ID } from '@/utils/editor/constants';
import { useAlbumTreeCovers } from '@/stores/cover';
import { isCurrentFolderLayflat } from '@/lib/utils/albumUtils';
import { findFolderByPageId } from '@/lib/TreeV5/utils/album';
import { folderMtypeEnum } from '@/utils/appConst';
const LAYFLAT_TYPE = 'LAYFLAT_TYPE';

export const useEditorPage = () => {
  const {
    album,
    dragType,
    handleDragOver,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    addTextToImage,
    clear,
    editThemeMutation,
  } = useMultiPageEditorDnd();

  const currentPageIndex = useAlbumTreeStore((state) => state.currentPageIndex);
  const currentPageInFolder = useAlbumTreeStore(
    (state) => state.currentPageInFolder
  );
  const isLayflat = useAlbumTreeStore((state) => state.isLayflat);

  // Cover store for managing cover view state
  const setIsCoverFullView = useAlbumTreeCovers(
    (state) => state.setIsCoverFullView
  );

  const folderByPageId = useAlbumTreeStore((state) => state.folderByPageId);
  const currentFolderImagesNum = useAlbumTreeStore(
    (state) => state.currentFolderImagesNum
  );
  const theme = useAlbumTreeStore((state) => state.theme);

  const setCurrentPageInFolder = useAlbumTreeStore(
    (state) => state.setCurrentPageInFolder
  );
  const setFolderByPageId = useAlbumTreeStore(
    (state) => state.setFolderByPageId
  );
  const setCurrentFolderImagesNum = useAlbumTreeStore(
    (state) => state.setCurrentFolderImagesNum
  );
  const setTotalPages = useAlbumTreeStore((state) => state.setTotalPages);
  const setTotalSpreads = useAlbumTreeStore((state) => state.setTotalSpreads);

  const removeImagesFromTree = useAlbumTreeStore(
    (state) => state.removeImagesFromTree
  );
  const changePageLayoutByLayoutId = useAlbumTreeStore(
    (state) => state.changePageLayoutByLayoutId
  );

  const nextPage = useAlbumTreeStore((state) => state.nextPage);
  const prevPage = useAlbumTreeStore((state) => state.prevPage);
  // Calculate current folder and total pages
  const currentFolder = useMemo(
    () => album?.m_treeV5.m_book_subtree.m_spread_folders[currentPageIndex],
    [album?.m_treeV5.m_book_subtree.m_spread_folders, currentPageIndex]
  );

  const totalSpreads = useMemo(
    () => album?.m_treeV5.m_book_subtree.m_spread_folders.length ?? 0,
    [album?.m_treeV5.m_book_subtree.m_spread_folders]
  );

  const totalPages = useMemo(
    () =>
      album?.m_treeV5.m_book_subtree.m_spread_folders.reduce(
        (total, spreadFolder) => {
          const nonNullChildren =
            spreadFolder.m_child_folders?.filter((child) => child !== null)
              .length || 0;

          const isLayflat = spreadFolder.m_type === LAYFLAT_TYPE;
          const hasNullItem = spreadFolder.m_child_folders?.includes(null);

          // For layflat: if no null items, count as 2 pages; if has null items, count as 1 page
          // For regular spreads: always count as number of non-null children
          if (isLayflat && !hasNullItem && nonNullChildren > 0) {
            return total + 2;
          }

          return total + nonNullChildren;
        },
        0
      ) || 0,
    [album?.m_treeV5.m_book_subtree.m_spread_folders]
  );

  // Update total pages when album changes
  useEffect(() => {
    setTotalPages(totalPages);
    setTotalSpreads(totalSpreads);
  }, [totalPages, setTotalPages, setTotalSpreads, totalSpreads]);

  // Handle current folder changes
  useEffect(() => {
    if (!currentFolder?.m_child_folders) {
      return;
    }

    // Set current page in folder logic
    if (currentFolder?.m_child_folders[0] === null) {
      setCurrentPageInFolder(currentFolder?.m_child_folders[1]?.m_folderID);
    } else if (isLayflat) {
      setCurrentPageInFolder(currentFolder?.m_child_folders[0]?.m_folderID);
    }
  }, [currentFolder, setCurrentPageInFolder, isLayflat]);

  // Handle folder by page id changes
  useEffect(() => {
    const folder =
      currentFolder?.m_child_folders &&
      currentFolder?.m_child_folders.find(
        (folder) => folder?.m_folderID === currentPageInFolder
      );
    setFolderByPageId(folder ?? null);
  }, [currentFolder?.m_child_folders, currentPageInFolder, setFolderByPageId]);

  // Handle current folder images count
  useEffect(() => {
    if (folderByPageId?.m_child_folders) {
      const imageCount = folderByPageId.m_child_folders.filter(
        (folder) => folder?.m_type !== folderMtypeEnum.TEXT_TYPE
      ).length;
      setCurrentFolderImagesNum(imageCount);
    }
  }, [folderByPageId, setCurrentFolderImagesNum]);

  useEffect(() => {
    if (theme && theme !== album?.m_treeV5.m_album_theme) {
      editThemeMutation({
        eventToken: album?.m_treeV5.m_album_token ?? '',
        album_theme: theme,
        tree: album,
      });
    }
  }, [theme, editThemeMutation, album]);

  const handleNextPage = useCallback(() => {
    nextPage();
    clear();
    // Reset cover view to split view when navigating to next page
    setIsCoverFullView(false);
  }, [nextPage, clear, setIsCoverFullView]);

  const handlePrevPage = useCallback(() => {
    prevPage();
    clear();
    // Reset cover view to split view when navigating to previous page
    setIsCoverFullView(false);
  }, [prevPage, clear, setIsCoverFullView]);

  const handleRemoveImageCurrentFolderImagesNum = useCallback(() => {
    if (currentFolderImagesNum) {
      setCurrentFolderImagesNum(currentFolderImagesNum - 1);
    }
  }, [currentFolderImagesNum, setCurrentFolderImagesNum]);

  const groupByCountLayflat = useLayoutTreeStore(
    (state) => state.groupByCountLayflat
  );
  const groupByCountSpread = useLayoutTreeStore(
    (state) => state.groupByCountSpread
  );

  const handleAddImageFromGrid = useCallback(
    ({
      imageId,
      targetPageId,
    }: {
      imageId: number;
      targetPageId?: string | number;
    }) => {
      // If targetPageId is provided, use target page context instead of current page
      if (targetPageId && album) {
        const spreadFolders = album.m_treeV5?.m_book_subtree?.m_spread_folders;
        if (!spreadFolders) return;

        const targetPageFolder = findFolderByPageId(
          spreadFolders,
          Number(targetPageId)
        );

        if (!targetPageFolder) return;

        // Use page-specific layflat check instead of global isLayflat
        const targetPageIsLayflat = isCurrentFolderLayflat(
          album,
          Number(targetPageId)
        );
        const targetLayoutsGroup = targetPageIsLayflat
          ? groupByCountLayflat
          : groupByCountSpread;

        // Check if there are empty slots (m_folderID === 0)
        const emptySlot = targetPageFolder.m_child_folders?.find(
          (folder: Folder | null) => folder && folder.m_folderID === 0
        );
        if (emptySlot) {
          // If there's an empty slot, use the current layout but fill the empty slot
          changePageLayoutByLayoutId(
            targetPageFolder.m_layoutID,
            targetPageFolder.m_layoutID,
            targetPageFolder.m_folderID,
            imageId
          );
          return;
        }

        // No empty slots, need to change layout to accommodate more images
        const targetPageImagesNum =
          targetPageFolder.m_child_folders?.filter(
            (folder) =>
              folder && folder.m_folderID !== 0 && folder.m_type !== 'TEXT_TYPE'
          )?.length || 0;

        // Add image to target page
        changePageLayoutByLayoutId(
          targetPageFolder.m_layoutID,
          targetLayoutsGroup[
            targetPageImagesNum === 0 ? 2 : targetPageImagesNum + 1
          ][0].m_ID,
          targetPageFolder.m_folderID,
          imageId
        );
      } else if (currentFolderImagesNum !== undefined && folderByPageId) {
        // Use page-specific layflat check for current page instead of global isLayflat
        const currentPageIsLayflat = isCurrentFolderLayflat(
          album,
          folderByPageId.m_folderID
        );

        const currentLayoutsGroup = currentPageIsLayflat
          ? groupByCountLayflat
          : groupByCountSpread;

        // Original logic for current page
        changePageLayoutByLayoutId(
          folderByPageId?.m_layoutID,
          currentLayoutsGroup[
            currentFolderImagesNum == 0 ? 2 : currentFolderImagesNum + 1
          ][0].m_ID,
          folderByPageId?.m_folderID,
          imageId
        );
        setCurrentFolderImagesNum(
          currentFolderImagesNum == 0 ? 2 : currentFolderImagesNum + 1
        );
      }
    },
    [
      album,
      currentFolderImagesNum,
      folderByPageId,
      changePageLayoutByLayoutId,
      setCurrentFolderImagesNum,
      groupByCountLayflat,
      groupByCountSpread,
    ]
  );

  const findImageFolderIdByUniqueId = useCallback(
    (album: PhotoAlbum, uniqueId: number) => {
      return album?.m_treeV5.m_book_subtree.m_tree_tmages.find(
        (image) => image.m_unique_id === uniqueId
      )?.m_folderID;
    },
    []
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { maxCountSpread, maxCountLayflat } = useLayoutTreeStore.getState();
      const maxCount = isLayflat ? maxCountLayflat : maxCountSpread;
      const isDropButton = event?.over?.id.toString().includes(DROP_BUTTON_ID);
      const alreadyMaxCount =
        folderByPageId?.m_child_folders?.length === maxCount;

      if (
        isDropButton &&
        (alreadyMaxCount ||
          (folderByPageId?.m_folderID &&
            event.active?.data?.current?.pageId
              .toString()
              .includes(folderByPageId?.m_folderID?.toString())))
      ) {
        return;
      }

      // For images from editor/sidebar, use atomic operation for undo
      const { pause, resume } = useAlbumTreeStore.temporal.getState();

      const prePauseState = useAlbumTreeStore.getState().album;

      pause();

      handleDragEnd(event);
      const updatedAlbum: PhotoAlbum | null =
        useAlbumTreeStore.getState().album;

      if (event.over?.id.toString().includes(DROP_BUTTON_ID) && updatedAlbum) {
        const targetPageId = event.over?.data?.current?.pageId;
        let imageFolderId = findImageFolderIdByUniqueId(
          updatedAlbum,
          event?.active?.data?.current?.id
        );

        if (imageFolderId) {
          // For images from grid, add directly to target page
          handleAddImageFromGrid({ imageId: imageFolderId, targetPageId });
        } else {
          // First remove from current location
          removeImagesFromTree(
            event?.active?.data?.current?.layoutId,
            event?.active?.data?.current?.pageId,
            [event?.active?.data?.current?.id],
            false
          );
          handleRemoveImageCurrentFolderImagesNum();

          // Then find the image and add to target page
          imageFolderId = findImageFolderIdByUniqueId(
            updatedAlbum,
            event?.active?.data?.current?.imageFromTree?.m_unique_id
          );

          if (imageFolderId) {
            handleAddImageFromGrid({ imageId: imageFolderId, targetPageId });
          }
        }
      }
      const latestAlbum = useAlbumTreeStore.getState().album;
      if (latestAlbum && prePauseState) {
        useAlbumTreeStore.getState().setAlbum(prePauseState);
      }
      resume();

      // Force state update to trigger undo history
      if (latestAlbum) {
        useAlbumTreeStore.getState().setAlbum(latestAlbum);
      }
    },
    [
      handleDragEnd,
      findImageFolderIdByUniqueId,
      handleAddImageFromGrid,
      handleRemoveImageCurrentFolderImagesNum,
      removeImagesFromTree,
      isLayflat,
      folderByPageId,
    ]
  );
  return {
    // Data
    album,
    dragType,
    currentFolder,
    totalPages,

    // Handlers
    handleDragOver,
    handleDragStart,
    handleDragCancel,
    onDragEnd,
    addTextToImage,
    clear,
    handleNextPage,
    handlePrevPage,
    handleAddImageFromGrid,
  };
};
