import { apiMethods, getApiUrl } from './config';
import useAlbumTreeStore from '@/stores/albumTree';
import { trackApiError } from '@/utils/datadogErrorTracking';

export const createAlbum = async ({
  token,
  albumName,
  eventType = 'REGULAR',
  flipbookNew = true,
  language,
  appVersion,
  deviceType,
  albumToken,
  isOnEditor,
}: {
  token: string;
  albumName: string;
  eventType: string;
  flipbookNew: boolean;
  language: string;
  appVersion: string;
  deviceType: string;
  albumToken?: string;
  isOnEditor?: boolean;
}) => {
  const params: { [key: string]: string } = albumToken
    ? {
        // Update existing album
        token,
        album_name: albumName,
        event_token: albumToken,
        ...(isOnEditor && {
          no_resp: 'true',
          tree_resp: 'true',
        }),
      }
    : {
        //Create new album
        token: token,
        album_name: albumName,
        event_type: eventType,
        flipbook_new: flipbookNew.toString(),
        lang: language,
        app_version: appVersion,
        device_type: deviceType,
      };

  const url = getApiUrl({
    method: apiMethods.updatealbum,
    params,
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
    // If updating existing album (albumToken) and on editor, update album tree store
    if (isOnEditor && albumToken && data?.payload) {
      useAlbumTreeStore.getState().updateAlbumAndClearHistory(data.payload);
    }
    return data;
  } catch (error) {
    trackApiError(error as Error, apiMethods.updatealbum, {
      method: 'GET',
      statusCode: (error as { status?: number })?.status,
      albumName,
      eventType,
      albumToken,
      isUpdate: !!albumToken,
    });
    throw error;
  }
};
