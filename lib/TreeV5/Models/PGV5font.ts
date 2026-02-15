import { FONTS_CATEGORY } from './TreeV5Common';

export interface PGV5Font_MM {
  m_unique_id: number;
  m_font_category: string;
  m_font_name: string;
  m_theme_family: string;
  m_base_family: string;
  m_style: string;
  m_base_font_size_mm: number;
  m_arabic_family: string;
  m_arabic_font_size_mm: number;
  m_cirilic_family: string;
  m_cirilic_font_size_mm: number;
}

export interface PGV5FontInfo_PX {
  m_family: string;
  m_font_size_px: number;
}

export interface PGV5Font_PX {
  m_font_category: FONTS_CATEGORY;
  m_font_name: string;
  m_theme_family: string;
  m_style: number;
  m_base: PGV5FontInfo_PX;
  m_arabic: PGV5FontInfo_PX;
  m_cirilic: PGV5FontInfo_PX;
}
