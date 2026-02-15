import { getApiUrl, apiMethods } from './config';

export const fetchEpilogProlog = async (
  eventToken: string,
  lang: string,
  isEpilog: boolean
) => {
  try {
    const response = await fetch(
      getApiUrl({
        method: apiMethods.getepiprotextpage,
        params: {
          event_token: eventToken,
          lang: lang,
          is_epilog: isEpilog.toString(),
        },
      })
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const { payload } = await response.json();
    return payload;
  } catch (error) {
    console.error('Failed to fetch epilog/prolog:', error);
    throw error;
  }
};
