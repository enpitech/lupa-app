import { PrintingQuality } from '@/types/previewImage';

export interface RoiRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoiDefault {
  m_crop_rect: RoiRect;
}

export interface ImageData {
  imgQuality?: PrintingQuality;
  imageUrlWithToken?: string;
  uniqueId: number;
  creation_date: string;
  event_token: string;
  facesVision: string;
  imageMediumHeight: number;
  imageMediumWidth: number;
  imageOriginalHeight: number;
  imageOriginalWidth: number;
  image_id: string;
  image_name: string;
  image_text: string;
  image_url_medium: string;
  image_url_thumb: string;
  insert_date: string;
  isMaster: boolean;
  isOwner: boolean;
  isPostCardEnabled: boolean;
  isStack: boolean;
  ownerid: number;
  ownername: string;
  roiDefault: RoiDefault[];
  status: string;
}

export interface ImageDataInGrid {
  imgQuality: PrintingQuality;
  imageUrlWithToken: string;
  uniqueId: number;
  creation_date: string;
  event_token: string;
  facesVision: string;
  imageMediumHeight: number;
  imageMediumWidth: number;
  imageOriginalHeight: number;
  imageOriginalWidth: number;
  image_id: string;
  image_name: string;
  image_text: string;
  image_url_medium: string;
  image_url_thumb: string;
  insert_date: string;
  isMaster: boolean;
  isOwner: boolean;
  isPostCardEnabled: boolean;
  isStack: boolean;
  ownerid: number;
  ownername: string;
  roiDefault: RoiDefault[];
  status: string;
}
export interface CustomSettings {
  sub_type?: string;
  format_id?: string;
  density?: string;
  direction?: string;
  album_theme?: string;
  layout?: string;
  skip_friend_start?: boolean;
  epilog_prolog_disable?: boolean;
  no_cover_edit?: boolean;
  add_remove_pages_disable?: boolean;
  skip_book_style_step?: boolean;
}
export interface Album {
  album_id: number;
  basket_date_utc: string | null;
  book_direction: string;
  cardFooter: string | null;
  cardHeader: string | null;
  category: string;
  close_date: string;
  close_date_utc: string;
  cover_id: string;
  cover_image: string;
  cover_snapshot: string;
  cover_image_height: number;
  cover_image_proportion: number;
  cover_image_width: number;
  cover_name: string;
  cover_real_height: number;
  cover_real_width: number;
  custom_settings: CustomSettings | null;
  event_status: string;
  event_token: string;
  event_type: string;
  event_type2: string;
  existEpilog: boolean;
  existEpilogQrCode: boolean;
  existProlog: boolean;
  existPrologQrCode: boolean;
  format: string;
  friends_arr: string[] | null;
  host_name: string;
  image_count: number;
  image_max: number;
  image_min: number;
  img_arr: ImageData[];
  in_basket: boolean;
  in_friend_basket: boolean;
  insert_date: string;
  insert_date_utc: string;
  isAdded: boolean;
  isAlbumOwner: boolean;
  jpeg_quality: number;
  jpeg_quality_ios: number;
  max_image_ratio: number;
  max_regular_image_count: number;
  max_resolution: number;
  members_count: number;
  mid_resolution: number;
  min_resolution: number;
  name: string;
  numberWaitingFriends: number;
  progress_status: string;
  purchased_date_utc: string | null;
  skin: string;
  terminal_date_utc?: string | null;
  update_date: string;
  update_date_utc: string;
  density?: string;
}

export interface AlbumStore {
  album: Album | null;
  setAlbum: (album: Album) => void;
  resetAlbum: () => void;
  addImage: (image: ImageData) => void;
  removeImageById: (id: number[]) => void;
  viewDeletionBar: boolean;
  setViewDeletionBar: (viewDeletionBar: boolean) => void;
  setAlbumCategory: (category: string) => void;
  setAlbumFormat: (format: string) => void;
  setAlbumDensity: (density: string) => void;
  setAlbumDirection: (direction: string) => void;
  setAlbumTheme: (theme: string) => void;
  setInBasket: (inBasket: boolean) => void;
  updateEpilogPrologStatus: ({
    isEpilog,
    exists,
  }: {
    isEpilog: boolean;
    exists: boolean;
  }) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  isCompleteStepLoadingPrologEpilog: boolean;
  setIsCompleteStepLoadingPrologEpilog: (
    isCompleteStepLoading: boolean
  ) => void;
  setCategory: (category: string) => void;
  isAlbumLocked: boolean;
  setIsAlbumLocked: (locked: boolean) => void;
  isCoffeeTable: boolean;
  setIsCoffeeTable: (isCoffeeTable: boolean) => void;
  // Actions
  fetchAndInitializeAlbum: (eventToken: string) => Promise<void>;
}
