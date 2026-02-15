import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { TemporalState } from 'zundo';
import useAlbumTreeStore, { AlbumTreeStore } from './index';
import { PhotoAlbum } from '@/types/tree';

type PartializedState = {
  album: PhotoAlbum | null;
};

function useAlbumTreeTemporalStore<T>(
  selector?: (state: TemporalState<PartializedState>) => T,
  equality?: (a: T, b: T) => boolean
) {
  return useStoreWithEqualityFn(
    useAlbumTreeStore.temporal,
    selector as (state: TemporalState<PartializedState>) => T,
    equality
  );
}

export type StoreWithTemporal = {
  temporal?: {
    getState?: () => TemporalState<AlbumTreeStore>;
  };
};

export default useAlbumTreeTemporalStore;
