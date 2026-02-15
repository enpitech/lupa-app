import i18n from '@/i18n';
import { URLS } from '@/utils/appConst';
import { apiMethods } from './config';
import { env } from '@/config/env';
export interface LicenseResponse {
  isValid: boolean;
  errorCode: number;
  errorMessage: string | null;
  payload: {
    version: string;
    language: string;
    template: string;
    placeholders?: {
      terms?: {
        label: string;
        url: string;
      };
      privacy?: {
        label: string;
        url: string;
      };
    };
  };
}

const createDefaultLicenseResponse = (): LicenseResponse => {
  const defaultVersion = env.DEFAULT_APPROVAL_VERSION || '1.2';
  const currentLanguage = i18n.language || 'he';

  return {
    isValid: true,
    errorCode: 0,
    errorMessage: null,
    payload: {
      version: defaultVersion,
      language: currentLanguage,
      template:
        currentLanguage === 'he'
          ? 'אני מאשר/ת את {terms} ואת {privacy}.'
          : 'I confirm that I have read the {terms} and {privacy}.',
      placeholders: {
        terms: {
          label: currentLanguage === 'he' ? 'התקנון' : 'terms and conditions',
          url: 'https://www.lupa.co.il/license/',
        },
        privacy: {
          label: currentLanguage === 'he' ? 'מדיניות הפרטיות' : 'privacy',
          url: 'https://www.lupa.co.il/privacy/',
        },
      },
    },
  };
};

export const fetchLicense = async (): Promise<LicenseResponse> => {
  try {
    const currentLanguage = i18n.language || 'he';
    const url = `${URLS.CONNECT_URL}/V2/api/entry.aspx?method=${apiMethods.license}&lang=${currentLanguage}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `License API returned ${response.status}, using default version`
      );
      return createDefaultLicenseResponse();
    }

    const rawData = await response.json();

    if (!rawData.isValid) {
      console.warn(
        'License API returned invalid response, using default version'
      );
      return createDefaultLicenseResponse();
    }

    // Normalize server payLoad/paylaod to our internal payload field
    const normalizedResponse: LicenseResponse = {
      isValid: rawData.isValid,
      errorCode: rawData.errorCode,
      errorMessage: rawData.errorMessage ?? null,
      payload: rawData.payload ?? rawData.payLoad,
    };

    return normalizedResponse;
  } catch (error) {
    console.warn(
      'Failed to fetch license from server, using default version:',
      error
    );
    return createDefaultLicenseResponse();
  }
};
