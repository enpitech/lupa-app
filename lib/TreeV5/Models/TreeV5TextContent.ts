import { TreeV5Text } from './TreeV5Text';
import { HORIZONTAL_ALIGNMENT } from './TreeV5Common';
import { VERTCAL_ALIGNMENT } from './TreeV5Common';

export interface TreeV5TextContent {
  m_folderID: number;
  m_text: TreeV5Text;
  m_textbox_horizontal_alignment: HORIZONTAL_ALIGNMENT;
  m_textbox_vertical_alignment: VERTCAL_ALIGNMENT;
  m_isLocked: boolean;
}
