import { FOLDER_TYPE } from './TreeV5Common';
import { Size } from './TreeV5Common';
import { PointF } from './TreeV5Common';
import { CONTAINER_PIVOT } from './TreeV5Common';
import { TreeV5Background } from './TreeV5Background';
import { TreeV5Frame } from './TreeV5Frame';
import { PGV5TextBox } from './TreeV5Theme';

export interface TreeV5Folder {
  m_type: FOLDER_TYPE;
  m_folderID: number;
  m_isLocked: boolean;
  m_rotation_deg: number;
  m_hide_text: boolean;
  m_size: Size;
  m_pivot: PointF;
  m_pivot_pos: CONTAINER_PIVOT;
  m_background: TreeV5Background;
  m_folder_frame: TreeV5Frame;
  m_textbox_frame: TreeV5Frame;
  m_textbox: PGV5TextBox;
  m_layoutID: number;
  m_child_folders: TreeV5Folder[];
}

export interface ImageIdentifyer {
  m_parentFolderID: number;
  m_folderPivot: PointF;
}
