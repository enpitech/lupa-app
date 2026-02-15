import useAlbumTreeStore from '@/stores/albumTree';
import { useAlertDialogStore } from '@/stores/alert-dialog';
import i18nInstance from '@/i18n';
import { openGenericErrorDialog } from './openGenericErrorDialog';

const DELAY_MS = 150;

export const openAlreadyInBasketAlertDialog = ({
  eventToken,
  async = false,
}: {
  eventToken: string;
  async?: boolean;
  // Sending async when we want to know what the dialog user action is (confirm or cancel)
}): Promise<void> | void => {
  const openDialog = useAlertDialogStore.getState().openDialog;
  if (async) {
    // Async behavior - return a promise that resolves or rejects based on user action.
    return new Promise((resolve, reject) => {
      openDialog({
        header: i18nInstance.t('errors.updateTree_title'),
        content: i18nInstance.t('errors.updateTree_basket.content'),
        confirmButtonText: i18nInstance.t('errors.updateTree_basket.confirm'),
        cancelButtonText: i18nInstance.t('errors.updateTree_basket.reject'),
        onConfirm: async () => {
          try {
            await useAlbumTreeStore.getState().deleteFromBasket(eventToken);
            resolve();
          } catch (error) {
            console.error(
              'Failed to delete album from basket (async mode):',
              error
            );
            setTimeout(() => {
              openGenericErrorDialog();
              reject();
            }, DELAY_MS);
          }
        },
        onCancel: () => {
          reject();
        },
      });
    });
  } else {
    openDialog({
      header: i18nInstance.t('errors.updateTree_title'),
      content: i18nInstance.t('errors.updateTree_basket.content'),
      confirmButtonText: i18nInstance.t('errors.updateTree_basket.confirm'),
      cancelButtonText: i18nInstance.t('errors.updateTree_basket.reject'),
      onConfirm: async () => {
        try {
          await useAlbumTreeStore.getState().deleteFromBasket(eventToken);
        } catch (error) {
          console.error(
            'Failed to delete album from basket (sync mode):',
            error
          );
          setTimeout(() => {
            openGenericErrorDialog();
          }, DELAY_MS);
        }
      },
      onCancel: () => {},
    });
  }
};
