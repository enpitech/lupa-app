import { editorMethods, getEditorUrl } from './config';

export const fetchTreeLayouts = async ({
  eventToken,
}: {
  eventToken: string;
}) => {
  const url = getEditorUrl({
    method: editorMethods.gettreelayouts3,
    eventToken,
  });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch tree layouts:', error);
    throw error;
  }
};
