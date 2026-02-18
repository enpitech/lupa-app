import { env } from '@/config/env';
import { useUserStore } from '@/stores/user';

export const apiMethods = {
  getPersonalInfo: 'getPersonalInfo',
  refreshToken: 'refreshToken',
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
