import { TreeV5Background } from '../Models/TreeV5Background';
import { TreeV5Frame } from '../Models/TreeV5Frame';
import { CoverFolder } from './CoverFolder';
import { TreeV5Image } from '../Models/TreeV5Image';
import { TreeV5TextContent } from '../Models/TreeV5TextContent';
import { TreeV5BGFramesAndText } from '../Models/TreeV5BGFramesAndText';
import { PGV5Frame_PX } from '../V5core/V5CoreUtils';

export interface CoverSpread {
  m_layout_ID: number;
  m_isLayoutSolid: boolean;
  m_background: TreeV5Background;
  m_leftRegionBG: TreeV5Background;
  m_rightRegionBG: TreeV5Background;
  m_spineBackground: TreeV5Background;
  m_spreadFrame: TreeV5Frame;
  m_leftRegFrame: TreeV5Frame;
  m_rightRegFrame: TreeV5Frame;
  m_folders: CoverFolder[];
  m_images4Cover: TreeV5Image[];
  m_coverTextsContent: TreeV5TextContent[];
  m_spineFramesAndText: TreeV5BGFramesAndText;
}

export interface CoverSpreadExt {
  m_CoverSpread: CoverSpread;
  m_coverFrames: PGV5Frame_PX[][];
}
