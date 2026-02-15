import { apiMethods, getApiUrl } from './config';

export interface FetchUploadSnapshotsCompleteParams {
  eventToken: string;
  orderId: string;
  uploadStatus: string;
}

export const fetchUploadSnapshotsComplete = async ({
  eventToken,
  orderId,
  uploadStatus,
}: FetchUploadSnapshotsCompleteParams) => {
  try {
    const url = getApiUrl({
      method: apiMethods.uploadsnapshotscomplete2,
      params: {
        event_token: eventToken,
        order_id: orderId,
        upload_status: uploadStatus,
      },
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to complete upload snapshots:', error);
    throw error;
  }
};
