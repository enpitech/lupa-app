import { StateCreator } from 'zustand';
import { AlbumTreeStore } from '..';
import { PhotoAlbum } from '@/types/tree';
import { trackError } from '@/utils/datadogErrorTracking';

const renameAlbum = (album: PhotoAlbum, newName: string): PhotoAlbum => {
  const updatedAlbumTree = structuredClone(album);
  const oldAlbumName = updatedAlbumTree.m_treeV5.m_album_name;
  updatedAlbumTree.m_treeV5.m_album_name = newName;

  // Update text entries that match the album name in both cover and book subtrees
  const updateTextEntries = (
    texts: { m_folderID: number; m_text?: { m_text_str: string } }[]
  ) => {
    texts.forEach((textEntry) => {
      // Update any text entry that matches the old album name
      if (textEntry.m_text?.m_text_str === oldAlbumName) {
        textEntry.m_text.m_text_str = newName;
      }
    });
  };

  // Update cover subtree text entries
  if (updatedAlbumTree.m_treeV5.m_cover_subtree?.m_tree_texts) {
    updateTextEntries(updatedAlbumTree.m_treeV5.m_cover_subtree.m_tree_texts);
  }

  // Update book subtree text entries if they exist
  if (updatedAlbumTree.m_treeV5.m_book_subtree?.m_tree_texts) {
    updateTextEntries(updatedAlbumTree.m_treeV5.m_book_subtree.m_tree_texts);
  }

  return updatedAlbumTree;
};

export const getRenameAlbumAction: StateCreator<
  AlbumTreeStore,
  [],
  [],
  AlbumTreeStore['renameAlbum']
> = (set, get) => (newName: string) => {
  try {
    const currentAlbumTree = get().album;

    if (!currentAlbumTree) {
      return;
    }

    const updatedAlbum = renameAlbum(currentAlbumTree, newName);
    set({ album: updatedAlbum });
  } catch (error) {
    trackError(error as Error, {
      errorType: 'store_error',
      store: 'albumTree',
      action: 'renameAlbum',
      newName,
      oldName: get().album?.m_treeV5?.m_album_name,
    });
  }
};
