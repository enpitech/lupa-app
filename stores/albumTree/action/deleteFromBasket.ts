import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { fetchRequestEditAlbum } from '@/services/api/fetchRequestEditAlbum';
import useAlbumStore from '@/stores/album';
import { trackError } from '@/utils/datadogErrorTracking';

export const getDeleteFromBasketAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['deleteFromBasket']
> = () => async (eventToken: string) => {
  try {
    await fetchRequestEditAlbum(eventToken);
    useAlbumStore.getState().setInBasket(false);
  } catch (error) {
    const errorObj =
      error instanceof Error
        ? error
        : new Error('Failed to request album edit');

    trackError(errorObj, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'deleteFromBasket',
      eventToken,
    });

    throw error;
  }
};
