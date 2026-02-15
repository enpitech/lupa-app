import { ALBUM_STRUCTURE } from './TreeV5Common';
import { VERTCAL_ALIGNMENT } from './TreeV5Common';

export interface PGV5TextBox {
  m_font_color: string;
  m_font_opacity: number;
  m_text_bg_color: string;
  m_text_bg_opacity: number;
}

export interface PGV5Theme {
  m_theme_id: number;
  m_theme_name: string;
  m_cover_family: string;
  m_book_layout_family: string;
  m_is_hagada: boolean;
  m_default_cover: string;
  mb_enabled: boolean;
  mb_enabledtest: boolean;
  m_structure: ALBUM_STRUCTURE;
}

export interface PGV5CoverTheme {
  m_cover_name: string;
  m_cover_family: string;
  m_cover_layout_family: string;
  mb_enabled: boolean;
  mb_enabledtest: boolean;
  m_spine_alignment: VERTCAL_ALIGNMENT;
}
