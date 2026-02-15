export enum RUN_STYLE {
  UNDEFINED = 0,
  DEBUG = 1,
  RELEASE = 2,
  PRODUCTION = 3,
}

export enum DRAW_STATE {
  NODRAW = 0,
  DRAW = 1,
  DRAW_DBG = 2,
  NODRAW_DBG = 3,
}

export enum JSON_TYPE {
  NONE = 0,
  COVER_SUB_TREE = 1,
  PREVIEW_DAT = 2,
}

export enum DENSITY_LEVEL {
  SINGLE = 0,
  MULTIPLE = 1,
  INTERVAL = 2,
}

export enum ID_INCRENMENT {
  NO_INCREMENT = 0,
  SPREAD = 1,
  SPINE = 2,
  REGIONS = 4,
  IMAGES = 8,
  TEXT = 16,
  TITLE = 32,
}

export enum ALBUM_TYPE {
  REGULAR = 'REGULAR',
  HAGGADAH = 'HAGGADAH',
  MINI_LUPA = 'MINI_LUPA',
}

export enum ALBUM_STRUCTURE {
  NORMAL = 0,
  HAGGADAH = 1,
  SUFFIX = 2,
  TEXT = 3,
}

export enum TEXT_PAGE_TYPE {
  PROLOG = 0,
  EPILOG = 1,
}

export enum EVENT_TYPE {
  DEFAULT_COVER = 0,
  ALL_THEMES = 1,
  SINGLE_THEME = 2,
  SELECTED_COVER = 3,
  CHANGE_COVER = 4,
  CHANGE_THEME = 5,
  CHANGE_TITLE = 6,
  DRAW_PREVIEW = 7,
  COVER_EDIT = 8,
  CHANGE_COVER_TYPE = 9,
  GENERATION = 10,
  PDFDRAWING = 11,
  UNDEFINED = 12,
}

export enum PROGRESS_TYPE {
  ERROR = -1,
  READY_4_COVER = 0,
  COVERS_PROCESS = 1,
  COVERS_GENERATED = 2,
  READY_4_GENERATION = 3,
  GENERATING_PROCESS = 4,
  GENERATED = 5,
  MAKE_SNAPSHOTS = 6,
  READY_4_SNAPSHOTS = 7,
  SNAPSHOTS_PROCESS = 8,
  SNAPSHOTS_READY = 9,
  PDF_PROCESS = 10,
  PDF_READY = 11,
  READY_4_GENERATION_DBG = 12,
  GENERATING_PROCESS_DBG = 13,
  GENERATED_DBG = 14,
  PDF_PROCESS_DBG = 15,
  PDF_READY_DBG = 16,
  READY_4_GENERATION_TST = 17,
  GENERATING_PROCESS_TST = 18,
  GENERATED_TST = 19,
  PDF_PROCESS_TST = 20,
  PDF_READY_TST = 21,
}

export enum SUBTREE_TYPE {
  ALBUM_SUB_TREE = 0,
  COVER_SUB_TREE = 1,
}

export enum BOOK_TEXT_DIRECTION {
  RTL = 0,
  LTR = 1,
}

export enum BACKGROUND_DIRECTION {
  RTL = 0,
  LTR = 1,
  ANY = 2,
}

export enum LAYOUT_CATEGORY {
  PAGE_LAYOUT = 0,
  COVER_LAYOUT = 1,
  SPINE_LAYOUT = 2,
  LAYFLAT_LAYOUT = 3,
  UNDEFINED = 4,
}
export enum CONTAINER_FAMILY {
  IMAGE = 0,
  TEXT = 1,
  TITLE = 2,
  SPINE = 3,
}

export enum CONTAINER_PIVOT {
  CENTER_PVT = 0,
  TOP_LEFT_PVT = 1,
  UNDEFINED = 2,
}

export enum TEXT_FOLDER_EXIST {
  NOT_EXISTS = 0,
  LEFT_REGION = 1,
  RIGHT_REGION = 2,
  BOTH_REGIONS = 3,
}

export enum FOLDER_TYPE {
  NULL_TYPE = 0,
  SPREAD_TYPE = 1,
  COVER_SPREAD_TYPE = 2,
  COVER_LEFT_REGION_TYPE = 3,
  COVER_RIGHT_REGION_TYPE = 4,
  LAYFLAT_TYPE = 5,
  IMAGE_TYPE = 6,
  TEXT_TYPE = 7,
  TITLE_TYPE = 8,
  SPINE_REGION_TYPE = 9,
  EMPTY_CONTAINER = 10,
  RIGHT_REGION_TYPE = 11,
  LEFT_REGION_TYPE = 12,
}

export enum IMAGE_STATUS {
  NORMAL_STAT = 0,
  STACK_STAT = 1,
  DELETED_STAT = 2,
}

export enum BACKGROUND_TYPE {
  NULL_BG = 0,
  PAGE_SPREAD_BG = 1,
  RIGHT_PAGE_BG = 2,
  COVER_SPREAD_BG = 3,
  SPINE_BG = 4,
  LAYFLAT_BG = 5,
  DEFAULT_BG = 6,
  RIGHT_LEFT_BG = 9, // TODO: check if this is correct
  RIGHT_COVER_BG = 7,
  LEFT_COVER_BG = 8,
}

export enum BG_PROCESSING_TYPE {
  DO_NOTHING = 0,
  MIRROR_TO_LTR = 1,
  CUT_TYPE = 2,
  CUT_AND_MIRROR_TO_LTR = 3,
}

export enum TREEV5_TEXT_STRIP {
  FULL,
  PERCENT,
}

export enum VERTCAL_ALIGNMENT {
  TOP = 0,
  CENTER = 1,
  BOTTOM = 2,
}

export enum HORIZONTAL_ALIGNMENT {
  LEFT = 0,
  MIDDLE = 1,
  RIGHT = 2,
  MIDDLE_FULL_WIDTH,
  NONE = 4,
}

export enum INFORMATION_POS {
  LEFT_MARGIN = 0,
  BOTTOM_MARGIN = 1,
  RIGHT_MARGIN = 2,
  P_LEFT_C_LEFT = 3,
  P_LEFT_C_BOTTOM = 4,
  P_LEFT_C_RIGHT = 5,
  P_BOTTOM_C_LEFT = 6,
  P_BOTTOM_C_BOTTOM = 7,
  P_BOTTOM_C_RIGHT = 8,
  P_RIGHT_C_LEFT = 9,
  P_RIGHT_C_BOTTOM = 10,
  P_RIGHT_C_RIGHT = 11,
}

export enum FONTS_CATEGORY {
  TITLE = 0,
  COVER_PAGE = 1,
  COVER_IMAGE = 2,
  SPINE = 3,
  PAGE = 4,
  IMAGE = 5,
  SPECIAL = 6,
}

export enum FRAME_BG_STYLE {
  SOLID_ST = 0,
  IMAGE_ST = 1,
  EMPTY_ST = 2,
}

export enum IDS_4_FRAMES {
  FRAMES_4_IMAGES = 0,
  FRAMES_4_TEXTS = 1,
  FRAMES_4_TITLE = 2,
  FRAMES_4_SPINE = 3,
  COUNT_NAMES_4_FRAMES = 4,
  FRAMES_EMPTY,
}

export enum COVER_TYPE {
  HARD_COVER = 0,
  SOFT_COVER = 1,
  LAYFLAT_COVER = 2,
}

export enum TYPE_OF_ALBUM {
  SQUARE_NORMAL = 0,
  SQUARE_LAYFLAT = 1,
  PANORAMIC_LAYFLAT = 2,
  PANORAMIC_NORMAL = 3,
  CLASSIC_NORMAL = 4,
  CLASSIC_LAYFLAT = 5,
}

export enum JPEG_ORIENTATION {
  NOTUSED = 0,
  JPEG_NORMAL = 1,
  MIRROR_HORIZONTAL = 2,
  ROTATE_180 = 3,
  MIRROR_VERTICAL = 4,
  MIRROR_HORIZONTAL_270 = 5,
  ROTATE_90 = 6,
  MIRROR_HORIZONTAL_90 = 7,
  ROTATE_270 = 8,
}

export enum MyFontStyle {
  Regular = 0,
  Bold = 1,
  Italic = 2,
  Underline = 4,
  Strikeout = 8,
}

export enum MyStyles4Fonts {
  REGULAR = 0,
  B = 1,
  I = 2,
  BI = 3,
  U = 4,
  BU = 5,
  IU = 6,
  BIU = 7,
  S = 8,
  BS = 9,
  IS = 10,
  BIS = 11,
  US = 12,
  BUS = 13,
  IUS = 14,
  BIUS = 15,
}

export enum BG_SCALE {
  ORIGINAL_SCALE = 0,
  MEDIUM_SCALE = 1,
  THUMBNAIL_SCALE = 2,
}

export enum STORAGE_TYPE {
  DEBUG,
  PRE_RELEASE,
  BETA_RELEASE,
  UNDEFINED,
}

export enum VALIDITY {
  NOT_AFFECT = 0,
  ENABLED = 1,
  FOR_TEST = 2,
  FOR_DEBUG = 3,
}

export enum FORMAT_NAME {
  bad_name,
  format_6 = 6,
  format_6_dbl = 6000,
  format_26 = 26,
  format_26_dbl = 26000,
  format_27 = 27,
  format_27_dbl = 27000,
  format_27_hgn = 27500,
  format_35 = 35,
  format_35_dbl = 35000,
  format_35_hgn = 35500,
  format_38 = 38,
  format_38_dbl = 38000,
}
export const LAYFLAT_INCR = 1000;
export const HAGGADAH_INCR = 2000;
export const DEBUG_FORMAT_ADD = 1000;

export enum FORMAT_TYPE {
  bad_format = 0,
  classic_normal = 6,
  classic_layflat = LAYFLAT_INCR + 6,
  haggadah_classic = HAGGADAH_INCR + 6,
  panoramic_normal = 26,
  panoramic_layflat = LAYFLAT_INCR + 26,
  square_normal = 27,
  square_layflat = LAYFLAT_INCR + 27,
  haggadah_square_normal = HAGGADAH_INCR + 27,
  square_large_normal = 35,
  square_large_layflat = LAYFLAT_INCR + 35,
  haggadah_square_large_normal = HAGGADAH_INCR + 35,
  mini_lupa_normal = 38,
}

export enum MSQL_PROCESS_STATUS {
  NONE = 0,
  BASKET = 1,
  PHONE_ORDER = 10,
  PRICE_NOT_MATCHING = 11,
  HOLD = 12,
  CANCELED = 13,
  CHARGE_FAILED = 14,
  CHARGED = 20,
  PRINTING_PROCESS = 21,
  PRINTED = 22,
  DELIVERED = 23,
  STOPPED = 24,
  PRINTING_PROCESS_FAILED = 25,
  WAITING_OVERLAY = 26,
  MASTERPASS_PENDING = 27,
}

export interface PointF {
  readonly IsEmpty: boolean;
  X: number;
  Y: number;
}
export interface Size {
  readonly Width: number;
  readonly Height: number;
}
export interface Rectangle {
  readonly IsEmpty: boolean;
  X: number;
  Y: number;
  Width: number;
  Height: number;
}
