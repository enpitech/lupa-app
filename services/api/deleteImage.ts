import { apiMethods, getApiUrl } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export const deleteImage = async ({
  eventToken,
  image_name,
}: {
  eventToken: string;
  image_name: string;
}) => {
  const url = getApiUrl({
    method: apiMethods.deleteImage,
    params: {
      event_token: eventToken,
      image_name: image_name,
    },
  });
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    trackApiError(error as Error, apiMethods.deleteImage, {
      statusCode: (error as { status?: number })?.status,
      eventToken,
      imageName: image_name,
    });
    throw error;
  }
};
