import { PGV5Background } from '../Models/TreeV5Background';
import { PGV5Font_PX } from '../Models/PGV5font';
import { PGV5Frame_PX } from '../V5core/V5CoreUtils';
import { PGV5CoverTheme } from '../Models/PGV5Theme';
import { ChildBGObjectsTable } from '../V5core/V5CoreUtils';
import { BOOK_TEXT_DIRECTION } from '../Models/TreeV5Common';

export interface CoverResources {
  m_BackgroundsLst: PGV5Background[];
  m_Fonts_PX: PGV5Font_PX[];
  m_Frame_PX: PGV5Frame_PX[];
  m_CoverTheme: PGV5CoverTheme;
  m_childBGObjectsTableLst: ChildBGObjectsTable[];
  m_bookDirection: BOOK_TEXT_DIRECTION;
}
