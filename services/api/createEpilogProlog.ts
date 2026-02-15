import { FormTextData } from '@/types/editor';
import { apiMethods, getApiUrl } from './config';

export const createEpilogProlog = async (
  eventToken: string,
  lang: string,
  isEpilog: boolean,
  data?: FormTextData,
  m_creationTime?: string | null
) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data || {}));

  const params = new URLSearchParams();
  params.append('data', JSON.stringify(data || {}));

  try {
    const response = await fetch(
      getApiUrl({
        method: apiMethods.saveepiprotextpage,
        params: {
          event_token: eventToken,
          lang: lang,
          is_epilog: isEpilog.toString(),
          force: 'false',
          ...(m_creationTime && { creation_time: m_creationTime }),
        },
      }),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to create epilog/prolog:', error);
    throw error;
  }
};
