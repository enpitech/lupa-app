import { apiMethods, getApiUrl } from './config';

export const deleteEpilogProlog = async ({
  isEpilog,
  eventToken,
}: {
  isEpilog: boolean;
  eventToken: string;
}) => {
  const url = getApiUrl({
    method: apiMethods.deleteepiprotextpage,
    params: {
      is_epilog: isEpilog.toString(),
      event_token: eventToken,
    },
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.isValid) {
      throw new Error(data.Error || `API Error: ${data.errorCode}`);
    }
    return data;
  } catch (error) {
    console.error('Error deleting epilog/prolog:', error);
    throw error;
  }
};
