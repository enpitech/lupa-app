import { COVER_TYPE } from './TreeV5Common';
import { ALBUM_TYPE } from './TreeV5Common';
import { BOOK_TEXT_DIRECTION } from './TreeV5Common';
import { TreeV5SubTree } from './TreeV5SubTree';
import { INFORMATION_POS } from './TreeV5Common';

export interface TreeV5 {
  m_VERSION: number;
  m_cover_type: COVER_TYPE;
  m_master_id: number;
  m_album_token: string;
  m_album_name: string;
  m_book_type: ALBUM_TYPE;
  m_album_direction: BOOK_TEXT_DIRECTION;
  m_cover_theme: string;
  m_cover_family: string;
  m_album_theme: string;
  m_format: number;
  m_DPI: number;
  m_minimalDPI: number;
  m_cover_subtree: TreeV5SubTree;
  m_book_subtree: TreeV5SubTree;
  m_infoStringPosition: INFORMATION_POS | null;
  m_infoCoverPosition: INFORMATION_POS | null;
}
