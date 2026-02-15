import { getApiUrl } from './config';
import { env } from '@/config/env';

export interface AcceptScreenLanguageRange {
  offet: [number, number];
}

export interface AcceptScreenLanguage {
  name: string;
  ranges: AcceptScreenLanguageRange[];
  specials: number[];
}

export interface StorylyConfig {
  enabled: boolean;
  token: string;
  group: string;
  story: string;
}

export interface AcceptScreenDomain {
  name: string;
  domain: string;
}

export interface AcceptScreenPayload {
  storyly_gppicker: {
    token: string;
    group: string;
    story: string;
  };
  storyly: {
    enabled: boolean;
    album_list: StorylyConfig;
    book_editor: StorylyConfig;
    gppicker: StorylyConfig;
    theme_categories: StorylyConfig;
    theme_covers: StorylyConfig;
    theme_covers_haggadah: StorylyConfig;
  };
  google_photos: string;
  showScreen: boolean;
  showAdvert: boolean;
  licenseVersion: string;
  booksPriceList: boolean;
  tilesPriceList: boolean;
  calendarsPriceList: boolean;
  haggadotPriceList: boolean;
  mosaicPriceList: boolean;
  showStoryly: boolean;
  domains: AcceptScreenDomain[];
  storyly_group_id: string;
  storyly_group_id_ios: string;
  agent_instagram: string;
  show_calendar: boolean;
  hide_delete_account: boolean;
  booksPriceListStandalone: boolean;
  calendarsPriceListStandalone: boolean;
  haggadotPriceListStandalone: boolean;
  mosaicPriceListStandalone: boolean;
  tilesPriceListStandalone: boolean;
  show_accessibility_standalone: boolean;
  show_spread_editor: boolean;
  orderlist_uri: string;
  checkout: string;
  show_orderlist_standalone: boolean;
  delete_account_api_v2: boolean;
  editor_poll_interval: number;
  texts_languages: AcceptScreenLanguage[];
  field_languages: AcceptScreenLanguage[];
}

export interface AcceptScreenResponse {
  isValid: boolean;
  errorCode: number;
  Error: string | null;
  method: string;
  payload: AcceptScreenPayload;
  errorDetails: string | null;
}

export const fetchAcceptScreen = async (): Promise<AcceptScreenResponse> => {
  try {
    const url = getApiUrl({
      method: 'acceptscreen',
      params: {
        isCustomErr: 'false',
        cloudcode: env.CLOUD_CODE,
        app_version: '3.5.109.d',
        device_type: 'desktop',
        lang: 'he',
      },
    });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch accept screen: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch accept screen:', error);
    throw error;
  }
};
