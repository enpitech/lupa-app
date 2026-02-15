export const PATHS = {
  LOGIN: '/login',
  DEFAULT: '/',
  HOME: '/home',
  MY_ALBUMS: '/my-albums',
  EDITOR: '/editor',
  PREVIEW: '/preview',
  CONFIGURE: '/configure/:albumToken',
  CREATE: '/create',
  CREATE_SQUARE_600: '/create?book_type=SQUARE_600',
  CREATE_HAGGADAH: '/create?book_type=HAGGADAH',
  CREATE_MINI_LUPA: '/create?book_type=MINI_LUPA',
  CHOOSE_PHOTO_SOURCE: '/choose-photo-source/:albumToken',
  GALLERY_STORAGE: '/gallery-storage/:albumToken',
  FORMAT: '/format/:albumToken',
  THEMES: '/themes/:albumToken',
  PROFILE: '/profile',
  PHOTO_STACK: '/photo-stack',
  WIZARD: '/wizard',
  BOOK_GENERATING: '/book-generating',
  PAYMENT: '/payment',
  MOBILE: '/mobile',
  ERROR_SCREEN: '/error-screen',
} as const;
export const ENV = {
  PROD: 'production',
  STAGING: 'staging',
  DEV: 'development',
} as const;

export const METHODS = {
  LOGIN_REGISTER: 'loginregister',
  REFRESH_TOKEN: 'refreshtoken',
} as const;

export const QUERY_KEY = {
  FETCH_USER: 'fetch-user',
  FETCH_USER_ALBUMS: 'fetch-user-albums',
  FETCH_EPILOG_PROLOG: 'fetch-epilog-prolog',
  CLOSE_ALBUM: 'close-album',
  FETCH_BOOK_COVER: 'fetch-book-cover',
  FETCH_ALBUM_PROGRESS: 'album-progress',
  ADD_TO_BASKET: 'add-to-basket',
  UPLOAD_SNAPSHOTS_COMPLETE: 'upload-snapshots-complete',
  RISE_EVENT: 'rise-event',
  ACCEPT_SCREEN: 'accept-screen',
  FETCH_LICENSE: 'fetch-license',
  ALBUMS_BY_EVENT_TOKEN: 'albums-by-event-token',
  FETCH_HELP_CONTENT: 'fetch-help-content',
} as const;
export const UPLOAD_SNAPSHOTS_STATUS = {
  UPLOAD_SUCCESS: 'UPLOAD_SUCCESS',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
} as const;

export interface GenericAlertMessageProps {
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
  className?: string;
}

export const AppConst = {
  CHANNEL_CALENDAR: 'calendar',
} as const;

export const NUMBERS = {
  MAX_INPUT_LENGTH: 28,
  MINIMUM_PHOTOS_FOR_ALBUM: 24,
};

export const ALBUM_PROGRESS_STATUS = {
  COMPLETE_STATUSES: [
    'PDF_READY',
    'GENERATED',
    'PDF_READY_TST',
    'GENERATED_TST',
    'PDF_READY_TST2',
    'GENERATED_TST2',
  ] as string[],
  PROGRESS_STATUSES: [
    'READY_4_COVER',
    'COVERS_PROCESS',
    'COVERS_GENERATED',
    'READY_4_GENERATION',
    'GENERATING_PROCESS',
    'READY_4_COVER_TST',
    'COVER_PROCESS_TST',
    'COVERS_GENERATED_TST',
    'GENERATING_PROCESS_TST',
    'READY_4_GENERATION_TST',
    'GENERATING_PROCESS_TST',
  ] as string[],
  ERROR_STATUSES: ['ERROR', 'ERROR_TST'] as string[],
};
export const URLS = {
  CONNECT_URL: 'https://connect.lupa.co.il',
  API_URL: 'https://groupav4.lupa.co/v1/api.aspx',
  API_URL_EDITOR: 'https://groupav4.lupa.co/v1/editor.aspx',
  API_URL_UPLOAD: 'https://groupav4.lupa.co/v1/upload.aspx',
  IMAGE_URL: 'https://img.lupa.co/v1/img.aspx',
  API_EPILOG_PROLOG_URL: 'https://groupav4.lupa.co/v1/epipropreviewonline.aspx',
  RESOURCES_IMAGE_URL: 'https://img.lupa.co/v1/Resources/background.aspx',
  API_PAYMENT_TEST_URL: 'https://payment-v4.lupa.co/api.aspx',
  API_PAYMENT_UI_URL:
    'https://paymentsv4-ui.lupa.co/basketItems?source_device=desktop&source_type=books',
  BOOK_COVER_SQUARE_600:
    'https://storage.googleapis.com/lupa-online-assets/%D7%9E%D7%95%D7%9B%D7%A0%D7%99%D7%9D/online_lupa_fix_cover.png',
  BOOK_COVER_MINI_LUPA:
    'https://storage.googleapis.com/lupa-online-assets/%D7%9E%D7%95%D7%9B%D7%A0%D7%99%D7%9D/online_mini_lupa_cover.png',
  BOOK_COVER_HAGGADAH:
    'https://storage.googleapis.com/lupa-online-assets/%D7%9E%D7%95%D7%9B%D7%A0%D7%99%D7%9D/online_haggadah_cover.png',
  BOOK_COVER_REGULAR:
    'https://storage.googleapis.com/lupa-online-assets/%D7%9E%D7%95%D7%9B%D7%A0%D7%99%D7%9D/regular_books_cover.png',
};

export type Events = {
  //my books
  online_view_book: {
    event_token: string;
  };
  online_show_photos: {
    event_token: string;
  };
  online_invite_friends: {
    event_token: string;
  };
  online_open_book: {
    event_token: string;
  };
  online_delete_book: {
    event_token: string;
  };
  online_add_basket: {
    event_token: string;
  };
  online_filter_books: {
    filter_type: string;
  };
  //create book
  online_create_book: {
    book_title: string;
    event_token: string;
  };
  //photo upload events
  online_photo_upload_started: {
    event_token?: string;
    total_files: number;
    source: string;
  };

  online_photo_upload_success: {
    event_token?: string;
    upload_time_ms: number;
  };
  online_photo_upload_failed: {
    event_token?: string;
  };
  online_photo_upload_completed: {
    event_token?: string;
    total_files: number;
    successful_files: number;
    failed_files: number;
    total_time_s: number;
    average_time_per_file_s: number;
    compression_time_s: number;
  };
  //upload photos modal
  online_upload_photos_finished: {
    Total_uploaded_images: number;
    Google_photos_uploaded_image: number;
    Local_device_images: number;
  };
  online_choose_app_device: {
    event_token: string;
    img_count: number;
  };
  online_choose_google_photos: {
    event_token: string;
    img_count: number;
  };
  online_choose_drag_photos: {
    event_token: string;
    img_count: number;
  };
  online_choose_folder: {
    event_token: string;
    img_count: number;
  };
  //choose format
  online_choose_format: {
    format_number: string;
    format_cover: string;
    event_token: string;
  };
  //configuration
  online_book_direction: {
    direction: string;
    event_token: string;
  };
  online_book_density: {
    density: string;
    event_token: string;
  };
  online_book_coffee_table: {
    book_style: string;
    event_token: string;
  };
  //theme
  online_choose_theme: {
    theme: string;
    event_token: string;
  };
  online_book_procces: {
    event_token: string;
  };
  login: {
    user_name: string;
    user_email: string;
  };
  online_my_albums_page: Record<string, never>;
  online_friend_open_book_modal: {
    event_token: string;
  };
  online_friend_close_book_modal: {
    event_token: string;
  };
  online_friend_share_icon: {
    source: 'copy' | 'email' | 'whatsapp';
  };
  online_friend_enter_book: {
    type: 'public' | 'private';
  };
};

export const LAYFLAT_TYPE = 'LAYFLAT_TYPE';

export const MIN_ALBUM_PAGE_COUNT = 24;

export const ENDPAPER_PAGE_IDS = {
  FIRST_PAGE_ENDPAPER: -1,
  LAST_PAGE_ENDPAPER: -2,
} as const;

export const UPPY_FILE_SOURCES = {
  GOOGLE_PHOTOS_PICKER: 'GooglePhotosPicker',
  DASHBOARD_MODAL: 'DashboardModal',
} as const;

export const API_GROUPA_UPLOAD_SOURCE = {
  PICASA: 'PICASA',
  NATIVE: 'NATIVE',
} as const;

export const ERROR_MESSAGES = {
  DATA_CONFLICT_ERROR_CODE: 409,
} as const;

export const SortingMethods = {
  InsertDateNewest: 'insert_date_newest',
  CreationDateNewest: 'creation_date_newest',
} as const;
export enum albumStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  UPLOAD_IMAGES = 'UPLOAD_IMAGES',
}

export enum eventTypeEnum {
  HAGGADAH = 'HAGGADAH',
  MINI_LUPA = 'MINI_LUPA',
  SQUARE_600 = 'SQUARE_600',
  REGULAR = 'REGULAR',
}

export enum coverTypeEnum {
  SQUARE = 'SQUARE',
  CLASSIC = 'CLASSIC',
  PANORAMIC = 'PANORAMIC',
}
export const ERROR_CODES = {
  NO_DATA_STORAGE: 'ERROR_NO_DATA_STORAGE',
  ALBUM_IN_BASKET: 'ERROR_ALBUM_IN_BASKET',
  ALBUM_IN_PRODUCTION: 'ERROR_ALBUM_IN_PRODUCTION',
  CONFLICT_TREE: 'ERROR_CONFLICT_TREE',
  UNABLE_PARSE_TREE_MESSAGE: 'ERROR_UNABLE_PARSE_TREE_MESSAGE',
  GETTING_FILES: 'ERROR_GETTING_FILES',
  IO_OPERATION_FAILED: 'ERROR_IO_OPERATION_FAILED',
  GENERIC_SERVER_ERROR: 'ERROR_GENERIC_SERVER_ERROR',
  NEGATIVE_PROGRESS: 'ERROR_NEGATIVE_PROGRESS',
  BOOK_NOT_READY: 'ERROR_BOOK_NOT_READY',
  PAGE_NUMBER: 'ERROR_PAGE_NUMBER',
  ALBUM_TOKEN: 'ERROR_ALBUM_TOKEN',
  THEME_IS_MISSING: 'ERROR_THEME_IS_MISSING',
  CUSTOM_MESSAGE: 'ERROR_CUSTOM_MESSAGE',
} as const;

export const ERROR_MESSAGES_TEXTS: Record<string, string> = {
  [ERROR_CODES.NO_DATA_STORAGE]: 'No data storage available. Please try again.',
  [ERROR_CODES.ALBUM_IN_BASKET]: 'This album is already in your basket.',
  [ERROR_CODES.ALBUM_IN_PRODUCTION]:
    'This album is currently in production and cannot be modified.',
  [ERROR_CODES.CONFLICT_TREE]:
    'Data conflict detected. Your changes have been synced with the latest version.',
  [ERROR_CODES.UNABLE_PARSE_TREE_MESSAGE]:
    'Unable to parse the album structure. Please try again.',
  [ERROR_CODES.GETTING_FILES]: 'Error retrieving files. Please try again.',
  [ERROR_CODES.IO_OPERATION_FAILED]: 'File operation failed. Please try again.',
  [ERROR_CODES.GENERIC_SERVER_ERROR]:
    'A server error occurred. Please try again later.',
  [ERROR_CODES.NEGATIVE_PROGRESS]: 'Invalid progress value detected.',
  [ERROR_CODES.BOOK_NOT_READY]: 'The book is not ready for this operation.',
  [ERROR_CODES.PAGE_NUMBER]: 'Invalid page number.',
  [ERROR_CODES.ALBUM_TOKEN]: 'Invalid album token.',
  [ERROR_CODES.THEME_IS_MISSING]: 'The selected theme is missing or unavailable.',
};

export const DUPLICATE_ERROR_MESSAGES = {
  EXCEED_COUNT: 'ERROR_EXCEED_COUNT_DUPLICATE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  GENERIC_ERROR: 'GENERIC_ERROR',
} as const;

export const epilogPrologueImages = {
  epilog:
    'https://storage.googleapis.com/lupa-online-assets/%D7%9E%D7%95%D7%9B%D7%A0%D7%99%D7%9D/Tumbnails/%D7%A1%D7%99%D7%95%D7%9E%D7%95%D7%9F.jpg',
  prolog:
    'https://storage.googleapis.com/lupa-online-assets/%D7%9E%D7%95%D7%9B%D7%A0%D7%99%D7%9D/Tumbnails/%D7%A7%D7%93%D7%99%D7%9E%D7%95%D7%9F.jpg',
} as const;

export enum paginationTabEnum {
  COVER = 'COVER',
  PAGES = 'PAGES',
}

export enum tourTypeEnum {
  IMAGES_TOUR = 'IMAGES_TOUR',
  EDITOR_TOUR = 'EDITOR_TOUR',
}

export enum friendsInviteTypeEnum {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum folderMtypeEnum {
  IMAGE_TYPE = 'IMAGE_TYPE',
  EMPTY_CONTAINER = 'EMPTY_CONTAINER',
  TEXT_TYPE = 'TEXT_TYPE',
}

export enum themesModeEnum {
  SIDEBAR = 'sidebar',
  WIZARD = 'wizard',
}
