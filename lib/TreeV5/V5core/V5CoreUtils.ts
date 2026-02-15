import { CONTAINER_FAMILY } from '../Models/TreeV5Common';
import { CONTAINER_PIVOT } from '../Models/TreeV5Common';
import { PGV5Background } from '../Models/TreeV5Background';
import { PGV5Font_PX } from '../Models/PGV5font';
import { TreeV5Layout } from '../Models/TreeV5Layout';
import { TreeV5Format } from '../Models/TreeV5Format';

export interface PGV5Frame_PX {
  m_unique_id: number;
  m_frame_name: string;
  m_theme_family: string;
  m_region_width_px: number;
  m_region_frame_opacity: number;
  m_region_image_or_color: string;
  m_font_color: string;
  m_font_opacity: number;
  m_font_bg_image_or_color: string;
  m_font_bg_opacity: number;
  m_container_frame_width_px: number;
  m_container_frame_image_or_color: string;
  m_container_frame_opacity: number;
  m_text_frame_opacity: number;
}
export interface PGV5Frame_PX {
  m_unique_id: number;
  m_frame_name: string;
  m_theme_family: string;
  m_region_width_px: number;
  m_region_frame_opacity: number;
  m_region_image_or_color: string;
  m_font_color: string;
  m_font_opacity: number;
  m_font_bg_image_or_color: string;
  m_font_bg_opacity: number;
  m_container_frame_width_px: number;
  m_container_frame_image_or_color: string;
  m_container_frame_opacity: number;
  m_text_frame_opacity: number;
}
export interface ChildBGObjectsTable {
  m_unique_id: number;
  m_TextFrameUniqueIDs: PGV5Frame_PX[];
  m_ImageFrameUniqueIDs: PGV5Frame_PX[];
}
export interface CV5Image4Album {
  m_score: number;
  m_image2ContainerRatio: number;
  m_imOrderIndex: number;
  m_layoutID: number;
  m_pageIndex: number;
  m_containerID: number;
  m_regionScore: number;
  m_ImageInContainerX: number;
  m_ImageInContainerY: number;
}

export interface CV5Album {
  m_albumScore: number;
  m_imCount: number;
  m_regionCount: number;
  m_imCountAllocated: number;
  m_imagesIntoAlbum: number;
}
export interface TreeV3Rectangle {
  m_X: number;
  m_Y: number;
  m_Width: number;
  m_Height: number;
}
export interface SystemV5LayoutContainer {
  iD: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ratio: number;
  family: CONTAINER_FAMILY;
  m_origin: CONTAINER_PIVOT;
}
export interface CV5Region4Album {
  m_pageScore: number;
  m_layoutInd: number;
  m_imageCount: number;
  m_imCountAllocated: number;
  m_imagesIntoAlbum: number;
}

export interface SharpV5Region4Album {
  m_regionScore: number;
  m_layoutInd: number;
  m_imagesIntoAlbum: CV5Image4Album[];
  m_regionType: REGION_TYPE;
}

export enum REGION_TYPE {
  REGULAR_REGION = 0,
  LAYFLAT_REGION = 1,
  INSERTED_REGION = 2,
}
export interface SystemV5 {
  lOG_NAME: string;
}

export interface SystemV5Error {
  errorCode: number;
  errorMessage: string;
  value: unknown;
  tAG: unknown;
}

export interface SystemV5Response extends SystemV5Error {
  isValid: boolean;
}

export interface TreeV5ResourcesOfTheme {
  m_layout_count: number;
  m_layout_set2_count: number;
  m_bg_resources: PGV5Background[];
  m_fonts_resources: PGV5Font_PX[];
  m_frames_resources: PGV5Frame_PX[];
  m_layouts_for_album: TreeV5Layout[];
  m_layouts_for_album_Set2: TreeV5Layout[];
}

export interface TreeV5ResourcesClass {
  m_intVersion: number;
  m_spine: number;
  m_treeV5Format: TreeV5Format;
  m_cover_resources: TreeV5ResourcesOfTheme;
  m_album_resources: TreeV5ResourcesOfTheme;
}
