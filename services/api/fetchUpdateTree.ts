import { TreeV5, PhotoAlbum } from '@/types/tree';
import { getEditorUrl } from './config';
import useAlbumTreeStore from '@/stores/albumTree';
import useAlbumStore from '@/stores/album';
import { ERROR_MESSAGES_TEXTS, ERROR_CODES } from '@/utils/appConst';
import { useAlertDialogStore } from '@/stores/alert-dialog';
import i18nInstance from '@/i18n';
import { openAlreadyInBasketAlertDialog } from '@/utils/editor/openAlreadyInBasketAlertDialog';
import { openGenericErrorDialog } from '@/utils/editor/openGenericErrorDialog';
import { useAlbumTreeCovers } from '@/stores/cover';

type UpdateTreeSuccessPayload = {
  m_creationTime: string;
};

export interface UpdateTreeResponse {
  isValid: boolean;
  errorCode: number;
  Error: string | null;
  method: string;
  payload: UpdateTreeSuccessPayload | PhotoAlbum;
  errorDetails: null;
}

const createUpdateTreeFormData = (
  tree: TreeV5 | null,
  deleteIds?: number[]
): FormData => {
  const formData = new FormData();
  formData.append('tree', JSON.stringify(tree || {}));

  if (deleteIds?.length) {
    formData.append('delete_image_ids', JSON.stringify(deleteIds));
  }

  return formData;
};

const handleDataConflictError = (
  data: PhotoAlbum,
  eventToken: string
): void => {
  const updateAlbumAndClearHistory =
    useAlbumTreeStore.getState().updateAlbumAndClearHistory;
  updateAlbumAndClearHistory(data);
  
  // Re-sync album store after conflict
  useAlbumStore
    .getState()
    .fetchAndInitializeAlbum(eventToken)
    .catch((error) => {
      console.error('Failed to re-sync album store after data conflict:', error);
    });
};

const handleResponseNotValid = (
  data: UpdateTreeResponse,
  eventToken: string
): void => {
  const errorCode = data.Error || data.errorCode;

  // Handle specific business errors inline where we have access to data
  if (errorCode === ERROR_CODES.CONFLICT_TREE && data.payload) {
    if (data.payload) {
      const album = data.payload as PhotoAlbum;
      handleDataConflictError(album, eventToken);
    }
    useAlbumTreeCovers.getState().setNeedUpdate(false);
  } else {
    // For unknown errors, throw the original error message
    throw new Error(`${data.Error}`);
  }
};

const processSuccessfulResponse = (data: UpdateTreeResponse): void => {
  if (data && data.payload) {
    const updateTreeSuccessPayload = data.payload as UpdateTreeSuccessPayload;
    const updateTreeCreationTime =
      useAlbumTreeStore.getState().updateTreeCreationTime;
    updateTreeCreationTime(updateTreeSuccessPayload.m_creationTime);
  }

  useAlbumTreeCovers.getState().setNeedUpdate(false);
};

const handleSpecificError = (
  errorMessage: string,
  eventToken: string
): void => {
  const openDialog = useAlertDialogStore.getState().openDialog;
  const isProcessingAddToBasket =
    useAlbumTreeStore.getState().isProcessingAddToBasket;

  switch (errorMessage) {
    case ERROR_CODES.ALBUM_IN_BASKET:
      if (!isProcessingAddToBasket) {
        openAlreadyInBasketAlertDialog({
          eventToken: eventToken,
        });
      }
      break;
    case ERROR_CODES.ALBUM_IN_PRODUCTION:
      openDialog({
        header: i18nInstance.t('errors.updateTree_title'),
        content: i18nInstance.t('errors.updateTree_production.content'),
        confirmButtonText: i18nInstance.t(
          'errors.updateTree_production.confirm'
        ),
        cancelButtonText: '',
        onConfirm: () => {},
        onCancel: () => {},
      });
      break;
    default:
      openGenericErrorDialog();
  }
};

export const fetchUpdateTree = async (
  eventToken: string,
  tree: TreeV5 | null,
  deleteIds?: number[],
  force?: 'false' | 'true'
) => {
  const isUpdateCover = useAlbumTreeCovers.getState().isNeedUpdate;
  const params = {
    force: force ?? 'false',
    isUpdateCover: String(isUpdateCover ?? false),
  };

  try {
    const response = await fetch(
      getEditorUrl({
        method: 'updatetree3',
        eventToken: eventToken,
        params,
      }),
      {
        method: 'POST',
        body: createUpdateTreeFormData(tree, deleteIds),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.isValid === false) handleResponseNotValid(data, eventToken);
    else {
    processSuccessfulResponse(data);
    }

    return data;
  } catch (error) {
    let errorMessage;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }

    console.error(
      ERROR_MESSAGES_TEXTS[errorMessage]
        ? `${errorMessage} - ${ERROR_MESSAGES_TEXTS[errorMessage]}`
        : errorMessage
    );

    // Handle specific error cases
    handleSpecificError(errorMessage, eventToken);

    throw error;
  }
};
