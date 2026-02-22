import { env } from '@/config/env';
import { useUserStore } from '@/stores/user';

export const apiMethods = {
  getPersonalInfo: 'getPersonalInfo',
  refreshToken: 'refreshToken',
  userAlbums: 'userAlbums',
  getepiprotextpage: 'getepiprotextpage',
} as const;

export const editorMethods = {
  gettreelayouts3: 'gettreelayouts3',
  updatetree3: 'updatetree3',
} as const;

export const getApiUrl = ({
  method,
  params = {},
}: {
  method: keyof typeof apiMethods;
  params?: Record<string, string>;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams: Record<string, string> = {
    app_version: '3.5.27.tf',
    device_type: 'mobile',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    token: params?.token ?? user?.token ?? '',
  };

  const allParams = {
    method: apiMethods[method],
    ...defaultParams,
    ...params,
  };

  const queryString = Object.entries(allParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.API_URL}?${queryString}`;
};

export const getLoginUrl = ({
  method,
  params = {},
}: {
  method: string;
  params?: Record<string, string>;
}) => {
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&');

  return `${env.CONNECT_URL}/${method}?${queryString}`;
};

export const getEditorUrl = ({
  method,
  eventToken,
  params = {},
}: {
  method: keyof typeof editorMethods;
  eventToken: string;
  params?: Record<string, string>;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams: Record<string, string> = {
    action: 'editor',
    isCustomErr: 'false',
    cloudcode: env.CLOUD_CODE,
    lang: 'en',
    app_version: '3.5.27.tf',
    device_type: 'mobile',
    image_list: 'true',
    show_basket: 'false',
    show_friend_basket: 'false',
    event_token: eventToken,
    token: user?.token ?? '',
  };

  const allParams = {
    ...defaultParams,
    ...params,
    method: editorMethods[method],
  };

  const queryString = Object.entries(allParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.API_URL_EDITOR}?${queryString}`;
};

export const getImageUrl = ({
  imgName,
  eventToken,
  type = 'medium',
  params = {},
}: {
  imgName: string;
  eventToken: string;
  type?: 'medium' | 'thumb';
  params?: Record<string, string>;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams: Record<string, string> = {
    event_token: eventToken,
    type,
    lang: 'en',
    app_version: '3.5.27.tf',
    device_type: 'mobile',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    picture: imgName,
    token: user?.token ?? '',
  };

  const allParams = { ...defaultParams, ...params };

  const queryString = Object.entries(allParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.IMAGE_URL}/${imgName}?${queryString}`;
};

export const getCoverImageUrl = ({
  eventToken,
  type = 'medium',
  params = {},
}: {
  eventToken: string;
  type?: 'medium' | 'thumb';
  params?: Record<string, string>;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams: Record<string, string> = {
    event_token: eventToken,
    type,
    lang: 'en',
    app_version: '3.5.27.tf',
    device_type: 'mobile',
    cloudcode: env.CLOUD_CODE,
    isCustomErr: 'false',
    token: user?.token ?? '',
  };

  const allParams = { ...defaultParams, ...params };

  const queryString = Object.entries(allParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.COVER_IMAGE_URL}?${queryString}`;
};

export const getBackgroundImageUrl = ({
  pictureId,
  albumToken,
  albumTheme,
  format,
  coverTheme,
  coverFamily,
  params = {},
}: {
  pictureId: string;
  albumToken: string;
  albumTheme: string;
  format: number;
  coverTheme: string;
  coverFamily: string;
  params?: Record<string, string>;
}) => {
  const user = useUserStore.getState().user;

  const defaultParams: Record<string, string> = {
    format: String(format),
    album_theme: albumTheme,
    cover_family: coverFamily,
    cover_theme: coverTheme,
    action: 'snapshots',
    picture: pictureId,
    size: 'medium',
    cloudcode: env.CLOUD_CODE,
    token: user?.token ?? '',
    album_token: albumToken,
  };

  const allParams = { ...defaultParams, ...params };

  const queryString = Object.entries(allParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&');

  return `${env.RESOURCES_IMAGE_URL}?${queryString}`;
};
