import { PhotoAlbum } from '@/types/tree';
import { editorMethods, getEditorUrl } from './config';
import { useAlbumTreeCovers } from '@/stores/cover';
import { albumHasMagazineLayouts } from '@/lib/TreeV5/utils/layouts';

export const editTheme = async ({
  eventToken,
  album_theme,
  tree,
  m_creationTime,
}: {
  eventToken: string;
  album_theme: string;
  tree: PhotoAlbum | null;
  m_creationTime?: string | null;
}) => {
  const formData = new FormData();

  formData.append('tree', JSON.stringify(tree?.m_treeV5));
  const isUpdateCover = useAlbumTreeCovers.getState().isNeedUpdate;

  // Determine if we need layout_c parameter based on album layouts
  const needsLayoutC = albumHasMagazineLayouts();

  // Add layout parameter only if album has Magazine layouts
  //m_creationTime dosent exsist on all books, only add if it does
  const params: Record<string, string> = {
    album_theme: album_theme,
    isUpdateCover: String(isUpdateCover ?? false),
    ...(m_creationTime && { creation_time: m_creationTime }),
    ...(needsLayoutC && { layout: 'layout_c' }),
  };

  const url = getEditorUrl({
    method: editorMethods.savetheme,
    eventToken,
    params,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const responseData = await response.json();

    if (!responseData.isValid) {
      throw new Error(
        `Error: Invalid response: ${JSON.stringify(responseData)}`
      );
    }

    useAlbumTreeCovers.getState().setNeedUpdate(false);
    return responseData;
  } catch (error) {
    console.error('Failed to edit theme:', error);
    throw error;
  }
};
