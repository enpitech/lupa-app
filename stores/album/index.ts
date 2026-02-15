import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Album, AlbumStore, ImageData } from './types';
import { fetchAlbumsByEventToken } from '@/services/api/fetchAlbumsByEventToken';
import { trackError } from '@/utils/datadogErrorTracking';
import { isInvalidImageData } from '@/utils/imageValidation';

const filterInvalidAlbumImages = (album: Album): Album => {
  const images = album?.img_arr || [];
  const validImages = images.filter((img) => !isInvalidImageData(img));

  if (validImages.length !== images.length) {
    const invalidImages = images.filter((img) => isInvalidImageData(img));
    trackError(new Error('Removed invalid images from album'), {
      errorType: 'data_sanitization',
      store: 'album',
      action: 'filterInvalidAlbumImages',
      invalidCount: invalidImages.length,
      imageNames: invalidImages.map((img) => img.image_name).join(','),
    });

    return {
      ...album,
      img_arr: validImages,
    };
  }

  return album;
};

const useAlbumStore = create<AlbumStore>()(
  persist(
    (set) => ({
      album: null,
      viewDeletionBar: false,
      isUploading: false,
      isCompleteStepLoadingPrologEpilog: false,
      isAlbumLocked: false,
      isCoffeeTable: false,
      setIsCompleteStepLoadingPrologEpilog(isCompleteStepLoading) {
        set({ isCompleteStepLoadingPrologEpilog: isCompleteStepLoading });
      },
      setAlbum: (album: Album) => set({ album: filterInvalidAlbumImages(album) }),
      resetAlbum: () => set({ album: null }),
      setViewDeletionBar: (viewDeletionBar: boolean) =>
        set({ viewDeletionBar }),
      setIsUploading: (isUploading: boolean) => set({ isUploading }),
      addImage: (image: ImageData) =>
        set((state) => {
          if (!state.album) {
            return state;
          }

          if (isInvalidImageData(image)) {
            trackError(new Error('Rejected invalid uploaded image'), {
              errorType: 'upload_validation_error',
              store: 'album',
              action: 'addImage',
              imageName: image?.image_name,
              imageId: image?.uniqueId,
              imageMediumWidth: image?.imageMediumWidth,
              imageMediumHeight: image?.imageMediumHeight,
            });
            return state;
          }

          const img_arr = [...(state.album.img_arr ?? []), image];
          return {
            album: {
              ...state.album,
              img_arr,
            },
          };
        }),
      removeImageById: (ids: number[]) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          const img_arr = state.album.img_arr
            ? state.album.img_arr.filter((img) => !ids.includes(img.uniqueId))
            : [];
          return {
            album: {
              ...state.album,
              img_arr,
            },
          };
        }),
      setAlbumCategory: (category: string) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              category,
            },
          };
        }),
      setAlbumFormat: (format: string) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              format,
            },
          };
        }),
      setAlbumDensity: (density: string) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              density,
            },
          };
        }),
      setAlbumDirection: (direction: string) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              book_direction: direction,
            },
          };
        }),
      setAlbumTheme: (theme: string) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              skin: theme,
            },
          };
        }),
      setInBasket: (inBasket: boolean) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          const updatedAlbum = {
            ...state.album,
            in_basket: inBasket,
          };
          // Update lock state when basket status changes
          const isLocked = !updatedAlbum.isAlbumOwner || updatedAlbum.in_basket;
          return {
            album: updatedAlbum,
            isAlbumLocked: isLocked,
          };
        }),
      setIsAlbumLocked: (locked: boolean) => set({ isAlbumLocked: locked }),
      setIsCoffeeTable: (isCoffeeTable: boolean) => set({ isCoffeeTable }),
      updateEpilogPrologStatus: ({
        isEpilog,
        exists,
      }: {
        isEpilog: boolean;
        exists: boolean;
      }) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              ...(isEpilog ? { existEpilog: exists } : { existProlog: exists }),
            },
          };
        }),
      setCategory: (category: string) =>
        set((state) => {
          if (!state.album) {
            return state;
          }
          return {
            album: {
              ...state.album,
              category,
            },
          };
        }),
      // Actions
      fetchAndInitializeAlbum: async (eventToken: string) => {
        try {
          const fetchedAlbum = await fetchAlbumsByEventToken({ eventToken });

          if (!fetchedAlbum.isValid) {
            throw new Error('Invalid album response');
          }

          set({ album: filterInvalidAlbumImages(fetchedAlbum.payload) });
        } catch (error) {
          trackError(
            error instanceof Error
              ? error
              : new Error('Failed to fetch and initialize album'),
            {
              errorType: 'store_error',
              store: 'album',
              action: 'fetchAndInitializeAlbum',
              eventToken,
            }
          );
        }
      },
    }),
    {
      name: 'album-storage',
      partialize: (state) => ({ album: state.album }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAlbumStore;
