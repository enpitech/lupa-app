import { TreeV5 } from '@/types/tree';
import useAlbumTreeStore from '@/stores/albumTree';
import { useCallback } from 'react';

export interface ImageToDelete {
  uniqueId: number;
  image_name: string;
}

interface UseDeleteImagesProps {
  setSelectedImages: React.Dispatch<React.SetStateAction<ImageToDelete[]>>;
  setViewDeletionBar: (show: boolean) => void;
  deleteImage: ({
    image_name,
    uniqueId,
  }: {
    image_name: string;
    uniqueId: number;
  }) => void;
  removeImageById: (ids: number[]) => void;
  removeImagesFromCache: (imageIds: number[]) => void;
  updateTree: (params: {
    eventToken: string;
    tree: TreeV5 | null;
    deleteIds: number[];
  }) => void;
  isOpenBook: boolean;
}

export function useDeleteImages({
  setSelectedImages,
  setViewDeletionBar,
  deleteImage,
  removeImageById,
  removeImagesFromCache,
  updateTree,
  isOpenBook,
}: UseDeleteImagesProps) {
  const albumTree = useAlbumTreeStore((state) => state.album);
  const clearTemporal = useCallback(() => {
    const clear = useAlbumTreeStore.temporal.getState().clear;
    clear();
  }, []);
  const deleteImagesInOpenBook = useCallback(
    (selectedImages: ImageToDelete[]) => {
      selectedImages.forEach(({ uniqueId, image_name }) => {
        deleteImage({ image_name, uniqueId });
        removeImageById([uniqueId]);
      });
      setSelectedImages([]);
    },
    [deleteImage, removeImageById, setSelectedImages]
  );

  const deleteImagesInCloseBook = useCallback(
    (selectedImages: ImageToDelete[]) => {
      updateTree({
        eventToken: albumTree?.m_treeV5.m_album_token || '',
        tree: albumTree?.m_treeV5 || null,
        deleteIds: selectedImages.map((img) => img.uniqueId),
      });
      selectedImages.forEach(({ uniqueId }) => {
        removeImageById([uniqueId]);
      });
      clearTemporal();
      setSelectedImages([]);
      setViewDeletionBar(false);
    },
    [
      updateTree,
      albumTree?.m_treeV5,
      removeImageById,
      setSelectedImages,
      setViewDeletionBar,
      clearTemporal,
    ]
  );

  const executeDelete = useCallback(
    (selectedImages: ImageToDelete[]) => {
      if (isOpenBook) {
        deleteImagesInOpenBook(selectedImages);
      } else {
        // In open book we update the cache optimistically in deleteImage mutation
        removeImagesFromCache(selectedImages.map((img) => img.uniqueId));
        deleteImagesInCloseBook(selectedImages);
      }
    },
    [
      isOpenBook,
      deleteImagesInOpenBook,
      deleteImagesInCloseBook,
      removeImagesFromCache,
    ]
  );

  return { executeDelete, deleteImagesInOpenBook, deleteImagesInCloseBook };
}
