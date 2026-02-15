import { PGV5FontInfo_PX } from './PGV5font';
import { BOOK_TEXT_DIRECTION } from './TreeV5Common';
import { TreeV5Rectangle } from './TreeV5Rectangle';

export interface TreeV5Text extends TreeV5Rectangle {
  m_DEFAULT_FONT: string;
  m_text_left_X: number;
  m_text_top_Y: number;
  m_text_rotation: number;
  m_base: PGV5FontInfo_PX;
  m_arabic: PGV5FontInfo_PX;
  m_cirilic: PGV5FontInfo_PX;
  m_default_font: PGV5FontInfo_PX;
  m_int_style: number;
  m_direction: BOOK_TEXT_DIRECTION;
  m_text_str: string;
}
