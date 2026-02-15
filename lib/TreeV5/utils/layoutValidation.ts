import useLayoutTreeStore from '@/stores/layout';
import useAlbumTreeStore from '@/stores/albumTree';
import { isLayflatAlbum } from '@/lib/utils/albumUtils';

/**
 * Validates a layout ID and returns a valid layout ID if needed
 * @param layoutId - The layout ID to validate
 * @param contentCount - Number of content items (for fallback)
 * @returns Valid layout ID
 */
export function validateLayoutId(
  layoutId: number,
  contentCount: number
): number {
  const {
    getLayflatLayoutById,
    getSpeardLayoutById,
    getRandomFromGroupByLayflatCount,
    getRandomFromGroupBySpreadCount,
  } = useLayoutTreeStore.getState();
  const { album } = useAlbumTreeStore.getState();
  const isLayflat = isLayflatAlbum(album);

  // Check if layout exists in the CORRECT store based on album type
  const layoutExists = isLayflat
    ? getLayflatLayoutById(layoutId)
    : getSpeardLayoutById(layoutId);

  if (layoutExists) {
    return layoutId;
  }

  // Layout ID is invalid, get a valid one based on content
  const validLayout = isLayflat
    ? getRandomFromGroupByLayflatCount(contentCount)
    : getRandomFromGroupBySpreadCount(contentCount);
  console.warn(
    `Invalid layout ID ${layoutId} replaced with ${validLayout.m_ID}`
  );
  return validLayout.m_ID;
}
