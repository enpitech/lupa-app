import { getUploadSnapshotsUrl } from './config';
import { trackApiError } from '@/utils/datadogErrorTracking';

export interface UploadSnapshotParams {
  orderId: string;
  eventToken: string;
  spreadIndex?: number;
  fileName: string;
  imageBlob: Blob;
}

export interface UploadSnapshotResponse {
  isValid: boolean;
  Error?: string;
  errorCode?: string;
  payload?: unknown;
}

export const uploadSnapshot = async ({
  orderId,
  eventToken,
  spreadIndex = 0,
  fileName,
  imageBlob,
}: UploadSnapshotParams): Promise<UploadSnapshotResponse> => {
  const url = getUploadSnapshotsUrl({
    orderId,
    eventToken,
    spreadIndex,
    fileName,
  });

  const formData = new FormData();
  formData.append('file', imageBlob, fileName);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    trackApiError(error as Error, 'uploadSnapshot', {
      method: 'POST',
      statusCode: (error as { status?: number })?.status,
      orderId,
      eventToken,
      spreadIndex,
      fileName,
    });
    throw error;
  }
};
