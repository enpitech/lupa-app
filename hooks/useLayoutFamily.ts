import { useMemo } from 'react';
import {
  getLayoutFamilyByPageId,
  getLayoutFamilyByLayoutId,
  LayoutFamilyType,
} from '@/lib/TreeV5/utils/layouts';
import useAlbumTreeStore from '@/stores/albumTree';

/**
 * Hook to get layout family information for a page or layout
 * @param pageId - The page ID to get family for
 * @param layoutId - The layout ID to get family for (alternative to pageId)
 * @returns The layout family type or null if not found
 */
export const useLayoutFamily = (
  pageId?: number,
  layoutId?: number
): LayoutFamilyType | null => {
  const album = useAlbumTreeStore((state) => state.album);

  return useMemo(() => {
    if (layoutId) {
      return getLayoutFamilyByLayoutId(layoutId);
    }
    if (pageId) {
      return getLayoutFamilyByPageId(album, pageId);
    }
    return null;
  }, [album, pageId, layoutId]);
};
