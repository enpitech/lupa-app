import { apiMethods, getApiUrl } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';
import { env } from '@/config/env';

export interface AddToBasketParams {
  eventToken: string;
  deviceType: string;
  lang: string;
  token: string;
  eventtype: string;
  format: string;
  coverType: string;
  pageType: string;
  theme: string;
  pages: number;
  quantity: number;
  platform: string;
  sourceType: string;
  sourceDevice: string;
}

export const addToBasket = async ({
  eventToken,
  deviceType,
  lang,
  token,
  eventtype,
  format,
  coverType,
  pageType,
  theme,
  pages,
  quantity,
  platform,
  sourceType,
  sourceDevice,
}: AddToBasketParams) => {
  const url = getApiUrl({
    api_base_url: env.API_PAYMENT_URL,
    method: apiMethods.add_basket,
    params: {
      event_token: eventToken,
      device_type: deviceType,
      lang,
      token,
      eventtype,
      format,
      cover_type: coverType,
      page_type: pageType,
      theme,
      pages: pages.toString(),
      quantity: quantity.toString(),
      platform,
      source_type: sourceType,
      source_device: sourceDevice,
    },
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    trackApiError(error as Error, apiMethods.add_basket, {
      method: 'GET',
      statusCode: (error as { status?: number })?.status,
      eventToken,
      format,
      coverType,
    });
    throw error;
  }
};
