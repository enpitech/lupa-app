import { FormTextData } from '@/types/editor';
import { getEpiProPreviewOnlineUrl } from './config';

export const fetchEpilogPrologPreview = async (
  eventToken: string,
  lang: string,
  isEpilog: boolean,
  data?: FormTextData
) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data || {}));

  const params = new URLSearchParams();
  params.append('data', JSON.stringify(data || {}));

  try {
    const response = await fetch(
      getEpiProPreviewOnlineUrl({
        eventToken,
        params: {
          lang,
          is_epilog: isEpilog.toString(),
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

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to fetch epilog/prolog preview:', error);
    throw error;
  }
};
