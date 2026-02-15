import { TreeV5Folder } from '@/lib/TreeV5/Models/TreeV5Folder';
import { TreeV5Message } from '@/lib/TreeV5/Models/TreeV5Message';
import { parseSizeLayout } from '@/lib/TreeV5/utils/layouts';
import { Size } from '@/lib/TreeV5/Models/TreeV5Common';

/**
 * Helper function to normalize size to lowercase convention
 * Pure function - safe to extract
 */
export const normalizeSize = (
  size: string | Size
): { width: number; height: number } => {
  if (typeof size === 'string') {
    return parseSizeLayout(size);
  }
  return { width: size.Width, height: size.Height };
};

/**
 * Get image data for a specific folder
 * Pure function - only depends on passed parameters
 */
export const getImageForFolder = (
  folder: TreeV5Folder,
  treeMessage: TreeV5Message
) => {
  if (!folder || !treeMessage?.m_treeV5?.m_cover_subtree?.m_tree_tmages) {
    return null;
  }
  const treeImages = treeMessage.m_treeV5.m_cover_subtree.m_tree_tmages;
  return treeImages.find((img) => img.m_folderID === folder.m_folderID);
};

/**
 * Get text data for a specific folder
 * Pure function - only depends on passed parameters
 */
export const getTextForFolder = (
  folder: TreeV5Folder,
  treeMessage: TreeV5Message
) => {
  if (!folder || !treeMessage?.m_treeV5?.m_cover_subtree?.m_tree_texts) {
    return null;
  }
  const treeTexts = treeMessage.m_treeV5.m_cover_subtree.m_tree_texts;
  return treeTexts.find((text) => text.m_folderID === folder.m_folderID);
};
