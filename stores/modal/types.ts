export type ModalSizeWidth =
  | 'w-1/2'
  | 'w-2/5'
  | 'w-3/5'
  | 'w-1/3'
  | 'w-2/3'
  | 'w-1/4'
  | 'w-3/4'
  | 'w-1/5'
  | 'w-4/5'
  | 'w-1/6'
  | 'w-5/6'
  | 'w-full'
  | 'w-96'
  | 'w-80'
  | 'max-w-md'
  | 'max-w-sm'
  | 'w-11/12'
  | 'w-full md:w-96'
  | 'w-full md:max-w-md'
  | 'w-11/12 md:w-96';

export type ModalSizeHeight =
  | 'h-1/2'
  | 'h-2/5'
  | 'h-3/5'
  | 'h-1/3'
  | 'h-2/3'
  | 'h-1/4'
  | 'h-3/4'
  | 'h-1/5'
  | 'h-4/5'
  | 'h-1/6'
  | 'h-5/6'
  | 'h-full'
  | 'min-h-96'
  | 'max-h-screen'
  | 'max-h-[calc(100vh-20px)]'
  | 'h-screen';

export type ModalSize = ModalSizeWidth | ModalSizeHeight;

export type ModalVariant = 'default' | 'destructive' | 'warning' | 'success';

export interface ModalState {
  isOpen: boolean;
  header: React.ReactNode | null;
  content: React.ReactNode | null;
  footer: React.ReactNode | null;
  variant: ModalVariant;
  modalWidth: ModalSize;
  modalHeight: ModalSize;
  showCloseButton: boolean;
  onClose?: () => void;
  confirmModal?: boolean;
  confirmModalMessage?: string;
  confirmModalMessageYes?: string;
  confirmModalMessageNo?: string;
  overflowHidden?: boolean;
  zIndex?: number | undefined;
  dataTestId?: string;
}

export interface OpenModalOptions {
  header: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
  variant?: ModalVariant;
  modalWidth?: ModalSize;
  modalHeight?: ModalSize;
  showCloseButton?: boolean;
  onClose?: () => void;
  confirmModal?: boolean;
  confirmModalMessage?: string;
  confirmModalMessageYes?: string;
  confirmModalMessageNo?: string;
  overflowHidden?: boolean;
  zIndex?: number | undefined;
  dataTestId?: string;
}

export interface ModalStore extends ModalState {
  openModal: (openModalOptions: OpenModalOptions) => void;
  closeModal: () => void;
  setHeader: (header: React.ReactNode) => void;
  setContent: (content: React.ReactNode) => void;
  setFooter: (footer: React.ReactNode) => void;
  setVariant: (variant: ModalVariant) => void;
  setModalWidth: (modalWidth: ModalSize) => void;
  setModalHeight: (modalHeight: ModalSize) => void;
  setShowCloseButton: (showCloseButton: boolean) => void;
  setOnClose: (onClose: (() => void) | undefined) => void;
  setConfirmModal?: (confirmModal: boolean) => void;
  setConfirmModalMessage?: (confirmModalMessage: string) => void;
  setConfirmModalMessageYes?: (confirmModalMessageYes: string) => void;
  setConfirmModalMessageNo?: (confirmModalMessageNo: string) => void;
}

export const initialState: ModalState = {
  isOpen: false,
  header: null,
  content: null,
  footer: null,
  variant: 'default',
  modalWidth: 'w-2/3',
  modalHeight: 'h-4/5',
  showCloseButton: true,
  onClose: undefined,
  confirmModal: false,
  overflowHidden: false,
  zIndex: undefined,
  dataTestId: undefined,
};
