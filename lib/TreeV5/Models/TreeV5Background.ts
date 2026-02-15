import { BG_PROCESSING_TYPE } from './TreeV5Common';
import { BACKGROUND_TYPE } from './TreeV5Common';
import { BACKGROUND_DIRECTION } from './TreeV5Common';

export interface TreeV5Background {
  m_unique_id: number;
  m_direction_type_bg: BG_PROCESSING_TYPE;
  m_color_im_id: string;
  m_bg_opacity: number;
  m_theme_name: string;
  m_theme_family: string;
  m_permissions: number;
}

export interface PGV5Background {
  m_unique_id: number;
  m_theme_family: string;
  m_local_index: number;
  m_bg_category: BACKGROUND_TYPE;
  m_direction_type_bg: BG_PROCESSING_TYPE;
  m_color_im_id: string;
  m_direction: BACKGROUND_DIRECTION;
  m_theme_name: string;
  m_bg_opacity: number;
  m_bg_childs_arr: number[];
  m_page_text_frames_names: string[];
  m_image_frames_names: string[];
  m_font_name: string;
  m_permissions: number;
}
