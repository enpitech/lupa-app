// TODO: Replace with RN components
// import { InvalidImagesModalHeader } from '@/components/photo/InvalidImagesModalHeader';
// import { InvalidImagesModalContent } from '@/components/photo/InvalidImagesModalContent';
// import { InvalidImagesModalFooter } from '@/components/photo/InvalidImagesModalFooter';
import { useModalStore } from '@/stores/modal';
import Uppy from '@uppy/core';
import { PhotoUppyFile, PhotoUploadMeta } from '@/lib/utils/uppy';
export function openInvalidFilesModal(
  invalidFiles: PhotoUppyFile[],
  uppyInstance: Uppy<PhotoUploadMeta, Record<string, never>>
) {
  const openModal = useModalStore.getState().openModal;
  const closeModal = useModalStore.getState().closeModal;

  const handleCloseModal = () => {
    try {
      if (uppyInstance) {
        invalidFiles.forEach((file) => {
          uppyInstance.removeFile(file.id);
        });
      }
    } catch (error) {
      console.error('Error removing invalid files from Uppy instance:', error);
    } finally {
      closeModal();
    }
  };

  openModal({
    header: <InvalidImagesModalHeader count={invalidFiles.length} />,
    content: <InvalidImagesModalContent invalidFiles={invalidFiles} />,
    footer: <InvalidImagesModalFooter onClose={handleCloseModal} />,
    modalWidth: 'w-2/5',
    modalHeight: 'h-3/4',
    confirmModal: false,
    onClose: handleCloseModal,
    overflowHidden: true,
    zIndex: 1500,
  });
}
