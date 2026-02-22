import type { TreeV5 } from '@/types/tree';
import { getEditorUrl } from './config';

type UpdateTreeResponse = {
  isValid: boolean;
  errorCode: number;
  Error: string | null;
  method: string;
  payload: { m_creationTime: string } | unknown;
  errorDetails: null;
};

export const fetchUpdateTree = async ({
  eventToken,
  tree,
}: {
  eventToken: string;
  tree: TreeV5;
}): Promise<UpdateTreeResponse> => {
  const url = getEditorUrl({
    method: 'updatetree3',
    eventToken,
    params: {
      force: 'false',
      isUpdateCover: 'false',
    },
  });

  const formData = new FormData();
  formData.append('tree', JSON.stringify(tree));

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('[fetchUpdateTree] HTTP error:', response.status, text);
    throw new Error(`Update tree failed: ${response.status} — ${text}`);
  }

  const data: UpdateTreeResponse = await response.json();

  if (data.isValid === false) {
    console.error('[fetchUpdateTree] Server rejected:', JSON.stringify(data));
    throw new Error(
      data.Error ?? `Tree update rejected (code ${data.errorCode})`
    );
  }

  return data;
};
