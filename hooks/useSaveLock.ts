import useAlbumTreeStore from '@/stores/albumTree';

const LOCK_CHECK_INTERVAL = 500; // 0.5 seconds
const LOCK_MAX_TIMEOUT = 2500; // 2.5 seconds
/**
 * Hook that provides a mechanism to wait for the auto-save lock to be released
 * before proceeding with a mutation. This prevents race conditions between
 * auto-save and manual save operations.
 */
export const useSaveLock = () => {
  /**
   * Waits for the auto-save process to complete before resolving.
   * Checks every 0.5 seconds until isInAutoSaveProcess is false.
   * @returns Promise that resolves when the lock is released
   */
  const waitForSaveLock = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkLock = () => {
        const isInAutoSaveProcess =
          useAlbumTreeStore.getState().isInAutoSaveProcess;

        if (!isInAutoSaveProcess) {
          // Lock is released, we can proceed
          resolve();
        } else {
          const elapsedTime = Date.now() - startTime;
          // Check if we've exceeded the max timeout for lock waiting
          if (elapsedTime >= LOCK_MAX_TIMEOUT) {
            reject(
              new Error(
                'Save lock timeout: Waited 2.5 seconds, but auto-save is still active.'
              )
            );
          } else {
            // Still locked, check again after interval
            setTimeout(checkLock, LOCK_CHECK_INTERVAL);
          }
        }
      };

      // Start checking
      checkLock();
    });
  };

  return { waitForSaveLock };
};
