import { useAlertDialogStore } from '@/stores/alert-dialog';
import i18nInstance from '@/i18n';

export const openGenericErrorDialog = () => {
  const openDialog = useAlertDialogStore.getState().openDialog;

  openDialog({
    header: i18nInstance.t('errors.updateTree_title'),
    content: i18nInstance.t('errors.updateTree_generic.content'),
    confirmButtonText: i18nInstance.t('errors.updateTree_generic.confirm'),
    cancelButtonText: '',
    onConfirm: () => {},
    onCancel: () => {},
  });
};
