import { FOLDER_TYPE, PointF, Size } from '../Models/TreeV5Common';
import { PGV5TextBox } from '../Models/TreeV5Theme';
import { TreeV5Background } from '../Models/TreeV5Background';
import { TreeV5Frame } from '../Models/TreeV5Frame';

export interface CoverFolder {
  m_folderType: FOLDER_TYPE;
  m_folderID: number;
  m_size: Size;
  m_pivot: PointF;
  m_folderFrame: TreeV5Frame;
  m_textBoxFrame: TreeV5Frame;
  m_textBox: PGV5TextBox;
  m_layoutID: number;
  m_background: TreeV5Background;
}
