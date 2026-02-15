import { create } from 'zustand';

export interface OpenAlertDialogOptions {
  header: string;
  content: string;
  cancelButtonText: string;
  confirmButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCheckbox?: boolean;
  checkboxLabel?: string;
  checkboxRequired?: boolean;
}

interface AlertDialogState {
  isOpen: boolean;
  header: string;
  content: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showCheckbox?: boolean;
  checkboxLabel?: string;
  checkboxRequired?: boolean;
  openDialog: (openAlertDialogOptions: OpenAlertDialogOptions) => void;
  closeDialog: () => void;
}

export interface AlertDialogStore extends AlertDialogState {
  openDialog: (openAlertDialogOptions: OpenAlertDialogOptions) => void;
  closeDialog: () => void;
}

export const useAlertDialogStore = create<AlertDialogState>((set) => ({
  isOpen: false,
  header: '',
  content: '',
  cancelButtonText: '',
  confirmButtonText: '',
  showCheckbox: false,
  checkboxLabel: '',
  checkboxRequired: false,
  onConfirm: () => {},
  onCancel: () => {},
  openDialog: (dialogProps) =>
    set({
      isOpen: true,
      ...dialogProps,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      ...{
        header: '',
        content: '',
        cancelButtonText: '',
        confirmButtonText: '',
        showCheckbox: false,
        checkboxLabel: '',
        checkboxRequired: false,
        onConfirm: undefined,
        onCancel: undefined,
      },
    }),
}));
