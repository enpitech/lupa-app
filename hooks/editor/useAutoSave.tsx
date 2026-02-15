import { useEffect, useRef } from 'react';
import { useInterval } from 'react-use';
import useAlbumTreeStore from '@/stores/albumTree';
import useAlbumStore from '@/stores/album';
import { useUpdateTree } from '@/hooks/useUpdateTree';
import { TreeV5 } from '@/types/tree';

const AUTO_SAVE_INTERVAL_TIME = 90000; // 90 seconds

function serializeTreeWithoutCreationTime(tree: TreeV5 | undefined): string {
  if (!tree) return '';

  // Use JSON.stringify with replacer to exclude m_creationTime
  return JSON.stringify(tree, (key, value) => {
    if (key === 'm_creationTime') return undefined;
    return value;
  });
}

export const useAutoSave = () => {
  const hasAlbumChangesRef = useRef(false);
  const lastTreeStringRef = useRef<string>('');

  const album = useAlbumTreeStore((state) => state.album);
  const isAlbumOwner = useAlbumStore((state) => state.album?.isAlbumOwner);
  const isAlbumLocked = useAlbumStore((state) => state.isAlbumLocked);
  const isProcessingAddToBasket = useAlbumTreeStore(
    (state) => state.isProcessingAddToBasket
  );
  // isInSaveProcess indicates if a save operation is currently ongoing like create/delete epilog, change theme.
  const isInSaveProcess = useAlbumTreeStore((state) => state.isInSaveProcess);
  const { mutate: updateTree, isPending: isUpdateTreeInProgress } =
    useUpdateTree();

  // Track album changes
  useEffect(() => {
    if (!album?.m_treeV5) return;
    const currentTreeString = serializeTreeWithoutCreationTime(album.m_treeV5);
    // Only flag a change if it's NOT the initial load AND the content has actually changed. Avoid updating on first load.
    if (
      lastTreeStringRef.current !== '' &&
      currentTreeString !== lastTreeStringRef.current
    ) {
      hasAlbumChangesRef.current = true;
    }

    // Always update the ref to the latest version for the next comparison.
    lastTreeStringRef.current = currentTreeString;
  }, [album?.m_treeV5]);

  // Auto-save interval
  useInterval(
    () => {
      // Perform auto-save if there are changes, album is not being added to basket, and not already saving / updating tree
      if (
        hasAlbumChangesRef.current &&
        !isProcessingAddToBasket &&
        !isInSaveProcess &&
        !isUpdateTreeInProgress
      ) {
        const currentAlbum = useAlbumTreeStore.getState().album;
        const albumWithCreationTime = useAlbumTreeStore
          .getState()
          .getTreeWithCreationTime();
        const albumToken = currentAlbum?.m_treeV5.m_album_token;

        if (albumToken && albumWithCreationTime?.m_treeV5) {
          useAlbumTreeStore.getState().setIsInAutoSaveProcess(true);
          // Start auto-save process
          updateTree(
            {
              eventToken: albumToken,
              tree: albumWithCreationTime.m_treeV5,
            },
            {
              onSuccess: () => {
                hasAlbumChangesRef.current = false;
              },
              onError: () => {
                console.error('Auto-save failed, will retry.');
              },
              onSettled: () => {
                useAlbumTreeStore.getState().setIsInAutoSaveProcess(false);
              },
            }
          );
        }
      }
    },
    // The delay. Set to `null` to pause the interval
    !!album?.m_treeV5 && isAlbumOwner && !isAlbumLocked
      ? AUTO_SAVE_INTERVAL_TIME
      : null
  );
};
