import { PointF } from '../Models/TreeV5Common';

export interface CoverImage {
  m_imageName: string;
  m_folderInd: number;
  m_unique_id: number;
  m_cropPos: PointF;
  m_medium2BoxScale: number;
  m_image_opacity: number;
  m_medium_width_pix: number;
  m_medium_height_pix: number;
}
