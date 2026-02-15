import { useCallback } from 'react';
import useAlbumTreeStore from '@/stores/albumTree';
import { findAndPrepareTargetPage } from '@/lib/TreeV5/utils/layouts';
import { Folder } from '@/types/tree';

/**
 * Custom hook to get page-specific image count
 * This centralizes the logic used by both DropImageButton and LayoutComponent
 */
export const usePageImageCount = () => {
  const album = useAlbumTreeStore((state) => state.album);

  const getPageImageCount = useCallback(
    (pageId: number): number => {
      if (!album || !pageId || pageId <= 0) return 0;

      // Create a mutable copy for findAndPrepareTargetPage to work with
      const mutableAlbum = structuredClone(album);

      // Find and prepare the target page using the same logic as existing components
      const targetPage = findAndPrepareTargetPage(mutableAlbum, pageId);

      if (!targetPage?.m_child_folders) return 0;

      // Count non-empty image containers (consistent with existing logic)
      return targetPage.m_child_folders.filter(
        (folder: Folder | null) => folder && folder.m_folderID !== 0
      ).length;
    },
    [album]
  );

  return { getPageImageCount };
};
