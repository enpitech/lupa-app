import { INFORMATION_POS } from './TreeV5Common';
import { Rectangle } from './TreeV5Common';

export interface TreeV5Format {
  m_cover_width_PX: number;
  m_cover_height_PX: number;
  m_page_width_PX: number;
  m_page_height_PX: number;
  m_cover_width_bleed_PX: number;
  m_cover_height_bleed_PX: number;
  m_page_width_bleed_PX: number;
  m_page_height_bleed_PX: number;
  m_spine_min_width_PX: number;
  m_spine_max_width_PX: number;
  m_spread_width_PX: number;
  m_scale_page_to_medium: number;
  m_scale_page_to_thumbnail: number;
  m_textContainers: Rectangle[];
  m_textContainers_layflat: Rectangle[];
  m_page_title_len_max: number;
  m_page_title_len_lf_max: number;
  m_information_pos: INFORMATION_POS;
  m_image_text_center_threshold: number;
  m_percent_padd_bg_rect_height: number;
  m_precent_padd_left_right: number;
  m_precent_padd_solid_left_right: number;
  m_padd_solid_for_thickness_PX: number;
}
