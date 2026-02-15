import { IMAGE_STATUS } from './TreeV5Common';
import { TreeV5Text } from './TreeV5Text';
import { JPEG_ORIENTATION } from './TreeV5Common';
import { TreeV3Rectangle } from '../V5core/V5CoreUtils';

export interface Rect4JsonF {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TreeV5Image {
  m_image_name: string;
  m_status: IMAGE_STATUS;
  m_unique_id: number;
  m_folderID: number;
  m_crop_rect: Rect4JsonF;
  m_image_opacity: number;
  m_text: TreeV5Text;
  m_isLocked: boolean;
  m_medium_width_px: number;
  m_medium_height_px: number;
  m_alignment: number;
  m_orientation: JPEG_ORIENTATION;
  m_faceRects: TreeV3Rectangle[];
}

export interface ClientV5Image {
  m_crop_rect: Rect4JsonF;
  m_folderID: number;
  m_image_name: string;
  m_isLocked: boolean;
  m_image_opacity: number;
  m_unique_id: number;
  m_alignment: number;
  m_orientation: JPEG_ORIENTATION;
}
