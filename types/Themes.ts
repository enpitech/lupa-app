import { TreeV5Message } from '@/lib/TreeV5/Models/TreeV5Message';

export type Theme = {
  id: string;
  coverFamily: string;
  displayName: string;
  disabledText: string;
  is_injection: boolean;
  is_haggadah: boolean;
  folderID: number;
  pageFolderID: number;
  is_selected_theme: boolean;
  tags?: string[];
};

export type Category = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  sortOrder?: number;
  themes: Theme[];
};

export type Design = {
  id: string;
  title: string;
  subtitle?: string;
  title_button: string;
  sortOrder?: number;
  categories: Category[];
};

export type SearchChipTag = {
  tagId: number;
  label: string;
};

export type SearchChipGroup = {
  groupId: number;
  title: string;
  tags: SearchChipTag[];
};

export type SearchChipTagApi = {
  tagId: number;
  label: string;
};

export type SearchChipGroupApi = {
  groupId: number;
  title: string;
  tags: SearchChipTagApi[];
};

export type SearchChipTagApiResponse = {
  tag_id: number;
  label: string;
};

export type SearchChipGroupApiResponse = {
  group_id: number;
  title: string;
  tags: SearchChipTagApiResponse[];
};

export const mapSearchChipGroupFromApi = (
  group: SearchChipGroupApiResponse
): SearchChipGroup => ({
  groupId: group.group_id,
  title: group.title,
  tags: group.tags.map((tag) => ({
    tagId: tag.tag_id,
    label: tag.label,
  })),
});

export const mapSearchChipGroupsFromApi = (
  groups?: SearchChipGroupApiResponse[]
): SearchChipGroup[] => groups?.map(mapSearchChipGroupFromApi) ?? [];

export type Themes = {
  payload: {
    m_treeMessage: TreeV5Message | null;
    designsNew?: Design[];
    searchChips?: SearchChipGroupApiResponse[];
  };
};
