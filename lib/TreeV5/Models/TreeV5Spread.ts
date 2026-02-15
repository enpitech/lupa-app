import { TreeV5Folder } from './TreeV5Folder';

export interface TreeV5Spread {
  m_spread_id: number;
  m_width: number;
  m_height: number;
  m_child_array: TreeV5Folder[];
  m_is_locked: boolean;
}
