import { DraggableDataPage } from '@/types/dnd';
import { PhotoAlbum } from '@/types/tree';

export const isDraggingBackwards = ({
  overPage,
  activePage,
  album,
}: {
  overPage: DraggableDataPage;
  activePage?: DraggableDataPage;
  album: PhotoAlbum | null;
}) => {
  if (!activePage) return false;
  const activePageId = activePage.id;
  const overPageId = overPage.id;
  const spreadFolders = album?.m_treeV5?.m_book_subtree?.m_spread_folders ?? [];
  const overSpreadFolderIndex = spreadFolders.findIndex(
    (folder) =>
      folder.m_child_folders?.findIndex(
        (child) => child?.m_folderID === overPageId
      ) !== -1
  );
  const activeSpreadFolderIndex = spreadFolders.findIndex(
    (folder) =>
      folder.m_child_folders?.findIndex(
        (child) => child?.m_folderID === activePageId
      ) !== -1
  );
  if (overSpreadFolderIndex === activeSpreadFolderIndex) {
    const overPageIndex =
      spreadFolders[overSpreadFolderIndex].m_child_folders?.findIndex(
        (child) => child?.m_folderID === overPageId
      ) ?? 0;
    const activePageIndex =
      spreadFolders[activeSpreadFolderIndex].m_child_folders?.findIndex(
        (child) => child?.m_folderID === activePageId
      ) ?? 0;
    return overPageIndex < activePageIndex;
  }
  return overSpreadFolderIndex < activeSpreadFolderIndex;
};
