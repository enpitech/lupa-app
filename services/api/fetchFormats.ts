import { getApiUrl, apiMethods } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export const fetchFormats = async ({
  eventToken,
  lang,
}: {
  eventToken: string;
  lang: string;
}) => {
  const url = getApiUrl({
    method: apiMethods.getbookformats,
    params: { event_token: eventToken, lang: lang },
  });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    trackApiError(error as Error, apiMethods.getbookformats, {
      statusCode: (error as { status?: number })?.status,
      eventToken,
      lang,
    });
    throw error;
  }
};
