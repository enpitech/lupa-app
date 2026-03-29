import { getUploadUrl } from './config';

export interface UploadPhotoParams {
  eventToken: string;
  fileUri: string;
  fileName: string;
}

export interface UploadPhotoResponse {
  isValid: boolean;
  Error?: string;
  errorCode?: string;
  payload?: unknown;
}

export const fetchUploadPhoto = async ({
  eventToken,
  fileUri,
  fileName,
}: UploadPhotoParams): Promise<UploadPhotoResponse> => {
  const url = getUploadUrl({ eventToken });

  const formData = new FormData();
  // React Native FormData accepts { uri, name, type } objects directly
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
};
