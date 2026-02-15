import { create } from 'zustand';
import { trackError } from '@/utils/datadogErrorTracking';

interface ImageCache {
  [key: string]: string;
}

interface ImageCacheStore {
  cache: ImageCache;
  addToCache: (imageId: string | number, imageUrl: string) => void;
  getFromCache: (imageId: string | number) => string | null;
  removeFromCache: (imageId: string | number) => void;
  clearCache: () => void;
}

const useImageCacheStore = create<ImageCacheStore>()((set, get) => ({
  cache: {},
  addToCache: (imageId, imageUrl) =>
    set((state) => ({
      cache: {
        ...state.cache,
        [imageId.toString()]: imageUrl,
      },
    })),
  getFromCache: (imageId) => {
    const { cache } = get();
    return cache[imageId.toString()] || null;
  },
  removeFromCache: (imageId) =>
    set((state) => {
      try {
        const key = imageId.toString();
        const urlToRevoke = state.cache[key];

        // Revoke the blob URL to free memory
        if (urlToRevoke && urlToRevoke.startsWith('blob:')) {
          // Delay revocation to ensure no ongoing usage, avoid race conditions
          setTimeout(() => URL.revokeObjectURL(urlToRevoke), 3000);
        }

        const newCache = { ...state.cache };
        delete newCache[key];
        return { cache: newCache };
      } catch (error) {
        trackError(
          error instanceof Error
            ? error
            : new Error('Failed to remove from cache'),
          {
            errorType: 'store_error',
            store: 'imageCache',
            action: 'removeFromCache',
            imageId: imageId.toString(),
          }
        );
        return state;
      }
    }),
  clearCache: () => {
    try {
      const { cache } = get();

      // Revoke all blob URLs before clearing
      Object.values(cache).forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });

      set({ cache: {} });
    } catch (error) {
      trackError(
        error instanceof Error ? error : new Error('Failed to clear cache'),
        {
          errorType: 'store_error',
          store: 'imageCache',
          action: 'clearCache',
          cacheSize: Object.keys(get().cache).length,
        }
      );
      // Still clear the cache even if revocation fails
      set({ cache: {} });
    }
  },
}));

export default useImageCacheStore;
