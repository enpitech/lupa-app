import { useTranslation } from '@/hooks/useTranslation';
import { deleteEpilogProlog } from '@/services/api/deleteEpilogProlog';
import useAlbumStore from '@/stores/album';
import useAlbumTreeStore from '@/stores/albumTree';
import { useAlertDialogStore } from '@/stores/alert-dialog';
import { albumStatusEnum } from '@/utils/appConst';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useSaveLock } from './useSaveLock';

export const useDeleteEpilogPrologMutation = ({
  eventToken,
}: {
  eventToken: string;
}) => {
  const openDialog = useAlertDialogStore((state) => state.openDialog);
  const { t } = useTranslation();
  const { waitForSaveLock } = useSaveLock();

  // State to track which type is being deleted (true for epilog, false for prolog, null for none)
  const [deletingType, setDeletingType] = useState<boolean | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ isEpilog }: { isEpilog: boolean }) => {
      setDeletingType(isEpilog);

      // Wait for auto-save lock to be released
      await waitForSaveLock();

      return deleteEpilogProlog({
        isEpilog,
        eventToken,
      });
    },
    onMutate: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(true);
    },
    onSuccess: (response, variables) => {
      if (response?.isValid && typeof variables?.isEpilog === 'boolean') {
        const album = useAlbumStore.getState().album;
        const isClosedBook = album?.event_status === albumStatusEnum.CLOSED;

        if (isClosedBook && response.payload) {
          const updateAlbumAndClearHistory =
            useAlbumTreeStore.getState().updateAlbumAndClearHistory;
          updateAlbumAndClearHistory(response.payload);
        }

        useAlbumStore.getState().updateEpilogPrologStatus({
          isEpilog: variables.isEpilog,
          exists: false,
        });
      }
      setDeletingType(null);
      return response;
    },
    onSettled: () => {
      useAlbumTreeStore.getState().setIsInSaveProcess(false);
    },
    onError: (error) => {
      setDeletingType(null);
      console.error('Error deleting epilog/prolog:', error);
      openDialog({
        header: t('epilog.prolog.delete.error.title'),
        content: t('epilog.prolog.delete.error.message'),
        confirmButtonText: t('epilog.prolog.delete.error.button'),
        cancelButtonText: '',
        onConfirm: () => {},
        onCancel: () => {},
      });
    },
  });

  return {
    ...mutation,
    isPrologDeleting: deletingType === false,
    isEpilogDeleting: deletingType === true,
  };
};
