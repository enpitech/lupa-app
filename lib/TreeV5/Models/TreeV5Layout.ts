import { SystemV5LayoutContainer } from '../V5core/V5CoreUtils';
import { CONTAINER_PIVOT } from './TreeV5Common';

export interface TreeV5Layout {
  m_ID: number;
  m_count: number;
  m_isSolid: boolean;
  m_containers: SystemV5LayoutContainer[];
  m_origin: CONTAINER_PIVOT;
}
