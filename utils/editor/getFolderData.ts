import { PhotoAlbum } from '@/types/tree';
import { getProccessedLayout } from '@/hooks/editor/useLayoutProcessing';

type GetFolderDataArgs = {
  albumTree: PhotoAlbum | null;
  albumToken: string;
  folderIndex: number;
  editorPageWidth: number;
  maxPageHeight: number;
};

export const getFolderData = ({
  albumTree,
  albumToken,
  folderIndex,
  editorPageWidth,
  maxPageHeight,
}: GetFolderDataArgs) => {
  if (!albumTree) {
    return;
  }

  const images = albumTree.m_treeV5?.m_book_subtree?.m_tree_tmages;

  return getProccessedLayout({
    layout:
      albumTree?.m_treeV5?.m_book_subtree?.m_spread_folders?.[folderIndex],
    images: images || [],
    eventToken: albumToken,
    maxPageHeight: maxPageHeight,
    pageWidth: editorPageWidth,
    album: albumTree,
    addTextToImage: () => {},
    options: { isCover: false, isSideBar: false },
  });
};
