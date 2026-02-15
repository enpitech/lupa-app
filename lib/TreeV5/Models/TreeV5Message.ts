import { SystemV5Error } from '../V5core/V5CoreUtils';
import { TreeV5 } from './TreeV5';
import { TreeV5ResourcesClass } from '../V5core/V5CoreUtils';

export interface TreeV5Message {
  m_version: number;
  m_isValid: boolean;
  m_errorStruct: SystemV5Error;
  m_treeV5: TreeV5;
  m_treeV5Resources: TreeV5ResourcesClass;
}

export interface Names4ThemeAPI {
  m_themeName: string;
  m_coverName: string;
  m_coverFamily: string;
  m_folderID: number;
}

export interface TreeV5Message4API {
  m_treeMessage: TreeV5Message;
  m_CoverNames: unknown[];
}
