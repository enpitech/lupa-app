import { PageMode } from '@/types/editor';
import useAlbumStore from '@/stores/album';
import { useUserStore } from '@/stores/user';
import { env } from '@/config/env';

export const apiMethods = {
  getPersonalInfo: 'getPersonalInfo',
  getBasketCount: 'getBasketCount',
  refreshToken: 'refreshToken',
  userAlbums: 'userAlbums',
  albumsByEventToken: 'albumsByEventToken',
  albumpreview2: 'albumpreview2',
  refreshtoken: 'refreshtoken',
  getbookformats: 'getbookformats',
  updatealbum: 'updatealbum',
  albumthemescategories: 'albumthemescategories',
  getepiprotextpage: 'getepiprotextpage',
  saveepiprotextpage: 'saveepiprotextpage',
  deleteepiprotextpage: 'deleteepiprotextpage',
  requesteditalbum: 'requesteditalbum',
  closealbum3: 'closealbum3',
  closealbumbookcovers: 'closealbumbookcovers',
  albumprogress: 'albumprogress',
  add_basket: 'add_basket',
  uploadsnapshotscomplete2: 'uploadsnapshotscomplete2',
  risedata: 'risedata',
  reopenalbum: 'reopenalbum',
  deleteImage: 'deleteImage',
  acceptscreen: 'acceptscreen',
  deleteAlbum: 'deleteAlbum',
  license: 'getlicene',
  carousel: 'carousel',
  friendlist: 'friendlist',
  friendinvite2: 'friendinvite2',
  friendchange: 'friendchange',
  friendapproved: 'friendapproved',
  frienddelete: 'frienddelete',
  frienddestroy: 'frienddestroy',
  friendshareinfo: 'friendshareinfo',
  friendrequest: 'friendrequest',
  duplicateAlbum: 'duplicateAlbum',
  gethelp: 'gethelp',
} as const;

export const editorMethods = {
  gettreelayouts3: 'gettreelayouts3',
  savetheme: 'savetheme',
  updatetree3: 'updatetree3',
  checkdate: 'checkdate',
} as const;

export const getApiUrl = ({
  method,
  params = {},
  api_base_url = '',
}: {
  method: keyof typeof apiMethods;
  params?: { [key: string]: string };
  api_base_url?: string;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams = {
    app_version: '3.5.27.tf',
    device_type: 'desktop',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    token: params?.token ?? user?.token,
  };

  return `${api_base_url || env.API_URL}?${Object.entries({
    method: apiMethods[method],
    ...defaultParams,
    ...params,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')}`;
};

export const getEditorUrl = ({
  method,
  eventToken,
  params = {},
}: {
  method: keyof typeof editorMethods;
  eventToken: string;
  params?: { [key: string]: string };
}) => {
  const user = useUserStore.getState().user;
  const defaultParams = {
    action: 'editor',
    isCustomErr: 'false',
    cloudcode: env.CLOUD_CODE,
    lang: 'en',
    app_version: '3.5.27.tf',
    device_type: 'desktop',
    image_list: 'true',
    show_basket: 'false',
    show_friend_basket: 'false',
    event_token: eventToken,
    token: user?.token,
  };
  return `${env.API_URL_EDITOR}?${Object.entries({
    ...defaultParams,
    ...params,
    method: editorMethods[method],
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')}`;
};

export const getLoginUrl = ({
  method,
  params = {},
}: {
  method: string;
  params?: { [key: string]: string };
}) => {
  const queryParams = {
    ...params,
  };

  const queryString = Object.entries(queryParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');
  return `${env.CONNECT_URL}/${method}?${queryString}`;
};

export const getImageUrl = ({
  // token,
  imgName,
  eventToken,
  mode,
  params = {},
}: {
  // token: string;
  imgName: string;
  eventToken: string;
  mode?: PageMode;
  params?: { [key: string]: string };
}) => {
  const user = useUserStore.getState().user;

  const defaultParams = {
    event_token: eventToken,
    type: mode === 'sidebar' ? 'thumb' : 'medium',
    lang: 'en',
    app_version: '3.5.27.tf',
    device_type: 'desktop',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    picture: imgName,
    token: user?.token,
  };

  return `${env.IMAGE_URL}/${imgName}?${Object.entries({
    ...defaultParams,
    ...params,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')}`;
};

export const getCoverImageUrl = ({
  eventToken,
  mode,
  params = {},
}: {
  eventToken: string;
  mode?: 'editor' | 'sidebar';
  params?: { [key: string]: string };
}) => {
  const user = useUserStore.getState().user;
  const lastModified =
    useAlbumStore.getState().album?.update_date_utc || Date.now();
  const defaultParams = {
    event_token: eventToken,
    type: mode === 'sidebar' ? 'thumb' : 'medium',
    lang: 'en',
    app_version: '3.5.27.tf',
    device_type: 'desktop',
    cloudcode: 'test',
    isCustomErr: 'false',
    token: user?.token,
  };

  return `${env.COVER_IMAGE_URL}?${Object.entries({
    ...defaultParams,
    ...params,
    tick: lastModified,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')}`;
};

export const getUploadUrl = ({
  eventToken,
  token,
  params = {},
}: {
  eventToken: string;
  token: string;
  params?: Record<string, string | number | boolean>;
}) => {
  const defaultParams = {
    filter: 'false',
    image_text: '',
    jpeg_quality: 40,
    lang: 'en',
    app_version: '3.4.128.tf',
    device_type: 'desktop',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    event_token: eventToken,
    token,
  };

  const queryString = Object.entries({
    ...defaultParams,
    ...params,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.API_URL_UPLOAD}?${queryString}`;
};
export const getEpiProPreviewOnlineUrl = ({
  eventToken,
  params = {},
}: {
  eventToken: string;
  params?: Record<string, string | number | boolean>;
}) => {
  const user = useUserStore.getState().user;
  const defaultParams = {
    event_token: eventToken,
    type: 'medium',
    app_version: '3.5.27.tf',
    device_type: 'desktop',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    token: user?.token,
  };

  const queryString = Object.entries({
    ...defaultParams,
    ...params,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.API_EPILOG_PROLOG_URL}?${queryString}`;
};

export const getUploadSnapshotsUrl = ({
  orderId,
  eventToken,
  spreadIndex = 0,
  spreadSide = 'full',
  fileName,
  params = {},
}: {
  orderId: string;
  eventToken: string;
  spreadIndex?: number;
  spreadSide?: 'full' | 'left' | 'right';
  fileName: string;
  params?: Record<string, string>;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams = {
    isCustomErr: 'false',
    cloudcode: 'test',
    app_version: '3.5.112.d',
    device_type: 'android',
    lang: 'he',
    token: user?.token || '',
    event_token: eventToken,
    orderID: orderId,
    flow: 'v4',
    use_snapshots_cookie: 'false',
    spread_index: spreadIndex.toString(),
    spread_side: spreadSide,
    file_name: fileName,
  };

  const queryString = Object.entries({
    ...defaultParams,
    ...params,
  })
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.UPLOAD_SNAPSHOTS_URL}?${queryString}`;
};
