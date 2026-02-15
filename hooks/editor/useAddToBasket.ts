import { useTranslation } from '@/hooks/useTranslation';
import { useUpdateTree } from '@/hooks/useUpdateTree';
import { addToBasket } from '@/services/api/addToBasket';
import { fetchUploadSnapshotsComplete } from '@/services/api/fetchUplodeSnapshotsComplete';
import { uploadSnapshot } from '@/services/api/uploadSnapshot';
import useAlbumStore from '@/stores/album';
import useAlbumTreeStore from '@/stores/albumTree';
import { useAlertDialogStore } from '@/stores/alert-dialog';
import { useUserStore } from '@/stores/user';
import { UPLOAD_SNAPSHOTS_STATUS } from '@/utils/appConst';
import { trackError } from '@/utils/datadogErrorTracking';
import { useState } from 'react';
import {
    useEditorSnapshot
} from './useEditorSnapshot';

type UseAddToBasketOptions = {
  onSuccess?: () => void;
};

export const useAddToBasket = (options?: UseAddToBasketOptions) => {
  const { t } = useTranslation();
  const openDialog = useAlertDialogStore((state) => state.openDialog);
  const getTreeWithCreationTime = useAlbumTreeStore(
    (state) => state.getTreeWithCreationTime
  );
  const setProcessingAddToBasketBoolean = useAlbumTreeStore(
    (state) => state.setProcessingAddToBasket
  );
  const { mutate: updateTree } = useUpdateTree();
  const { getSnapshotImages } = useEditorSnapshot();

  const [processingAddToBasket, setProcessingAddToBasket] = useState<
    'loading' | 'success' | 'error' | null
  >();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const processAddToBasket = async () => {
    let orderId = '';
    const eventToken = useAlbumTreeStore.getState().album?.m_treeV5.m_album_token || '';
    const token = useUserStore.getState().user?.token || '';
    const isAlbumOwner = useAlbumStore.getState().album?.isAlbumOwner;

    try {
      setProcessingAddToBasketBoolean(true);
      const albumWithCreationTime = getTreeWithCreationTime();
      if (isAlbumOwner) {
        // need to pass force to run over the album if he already in basket
        updateTree({
          eventToken,
          tree: albumWithCreationTime?.m_treeV5 ?? null,
          force: useAlbumStore.getState().album?.in_basket ? 'true' : 'false',
        });
      }

      setProcessingAddToBasket('loading');
      setLoadingProgress(0);
      const {
        m_format: format,
        m_cover_type: coverType,
        m_album_theme: albumTheme,
        m_book_subtree: { m_spread_folders: spreadFolders } = {},
      } = albumWithCreationTime?.m_treeV5 || {};

      const convertPageType = (pageType?: string) => {
        switch (pageType) {
          case 'HARD_COVER':
            return '0';
          case 'LAYFLAT_COVER':
            return '5';
        }
      };
      useAlbumTreeStore.getState().setIsExpanded(false);

      document.body.style.overflow = 'hidden';
      const snapshotImages = await getSnapshotImages((snapshotProgress) => {
        // Snapshot generation takes 50% of total progress
        const progressValue =
          typeof snapshotProgress === 'number' ? snapshotProgress : 0;
        const normalizedProgress = Math.round((progressValue / 100) * 50);
        setLoadingProgress(normalizedProgress);
      });

      const addToBasketResponse = await addToBasket({
        coverType: '0',
        eventToken,
        format: format?.toString() || '',
        pageType: convertPageType(coverType) || '',
        theme: albumTheme || '',
        pages: (spreadFolders?.length ?? 0) * 2 || 0,
        quantity: 1,
        platform: 'web',
        sourceType: 'books',
        sourceDevice: 'desktop',
        deviceType: 'web',
        lang: 'en',
        token,
        eventtype: 'album',
      });
      if (Array.isArray(addToBasketResponse?.payload)) {
        orderId = addToBasketResponse?.payload[0]?.orderId;
      } else {
        orderId = addToBasketResponse?.payload?.orderId;
      }
      if (!orderId) {
        throw new Error('Order ID not found');
      }

      const totalSnapshots = snapshotImages.size;
      let uploadedCount = 0;

      for (const [index, imageFile] of snapshotImages) {
        await uploadSnapshot({
          orderId: orderId?.toString() || '',
          eventToken,
          spreadIndex: index,
          fileName: imageFile.name,
          imageBlob: imageFile,
        });

        uploadedCount++;
        // Upload phase starts at 50% and goes to 100%
        const uploadProgress =
          50 + Math.round((uploadedCount / totalSnapshots) * 50);
        setLoadingProgress(uploadProgress);
        // Update progress for each uploaded snapshot
      }

      await fetchUploadSnapshotsComplete({
        eventToken,
        orderId: orderId?.toString() || '',
        uploadStatus: UPLOAD_SNAPSHOTS_STATUS.UPLOAD_SUCCESS,
      });

      setLoadingProgress(100);
      setProcessingAddToBasket('success');
      options?.onSuccess?.();
    } catch (error) {
      trackError(error as Error, {
        errorType: 'editor_error',
        component: 'useAddToBasket',
        action: 'addToBasket',
        eventToken,
        orderId: orderId?.toString(),
        timestamp: new Date().toISOString(),
      });
      console.error('Error during add to basket process:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        eventToken,
        orderId: orderId || 'No order ID available',
        timestamp: new Date().toISOString(),
      });

      // Send error status to complete the upload snapshots process
      try {
        await fetchUploadSnapshotsComplete({
          eventToken,
          orderId: orderId?.toString() || '',
          uploadStatus: UPLOAD_SNAPSHOTS_STATUS.UPLOAD_ERROR,
        });
      } catch (completeError) {
        trackError(completeError as Error, {
          errorType: 'editor_error',
          component: 'useAddToBasket',
          action: 'uploadSnapshotsCompleteError',
          eventToken,
          orderId: orderId?.toString(),
        });
        console.error(
          'Failed to send upload complete error status:',
          completeError
        );
      }

      // Restore body overflow on error
      setProcessingAddToBasket('error');
    } finally {
      setProcessingAddToBasketBoolean(false);
      // Restore body overflow after all uploads are complete
      document.body.style.overflow = '';
    }
  };

  const showAddToBasketConfirmation = () => {
    openDialog({
      header: t('editor.basket.confirm.title'),
      content: '',
      cancelButtonText: t('editor.basket.confirm.cancel'),
      confirmButtonText: t('editor.basket.confirm.confirm'),
      showCheckbox: true,
      checkboxLabel: t('editor.basket.confirm.checkbox'),
      checkboxRequired: true,
      onConfirm: processAddToBasket,
      onCancel: () => {},
    });
  };

  return {
    showAddToBasketConfirmation,
    processAddToBasket,
    processingAddToBasket,
    loadingProgress,
    setProcessingAddToBasket,
    setLoadingProgress,
  };
};
