import { SUBTREE_TYPE } from './TreeV5Common';
import { TreeV5Folder } from './TreeV5Folder';
import { TreeV5Image } from './TreeV5Image';
import { TreeV5TextContent } from './TreeV5TextContent';
import { Names4ThemeAPI } from './TreeV5Message';

export interface ActionPlace {
  m_Id: number;
  m_folderID: number;
}

export interface TreeV5URLInfo {
  aLL_FOLDERS_ID: number;
  m_folderID: number;
  m_urlInfo: string;
}

export interface TreeV5SubTree {
  m_subtree_type: SUBTREE_TYPE;
  m_spread_folders: TreeV5Folder[];
  m_tree_tmages: TreeV5Image[];
  m_tree_texts: TreeV5TextContent[];
  m_url_information: TreeV5URLInfo[];
  m_next_folderID: number;
  m_additionalInfo: Names4ThemeAPI[];
}
