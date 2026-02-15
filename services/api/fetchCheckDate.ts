import { getEditorUrl, editorMethods } from './config';
import { TreeV5 } from '@/types/tree';

export interface CheckDateResponse {
  isValid: boolean;
  errorCode?: string | number;
  payload?: {
    m_treeV5?: TreeV5;
  };
}

export const fetchCheckDate = async (
  eventToken: string,
  creationTime: string
): Promise<CheckDateResponse> => {
  try {
    const response = await fetch(
      getEditorUrl({
        method: editorMethods.checkdate,
        eventToken,
        params: {
          creation_time: creationTime,
        },
      })
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to check date:', error);
    throw error;
  }
};
