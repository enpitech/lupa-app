// Basic types
export type Size = { width: number; height: number };
export type Point = { X: number; Y: number; IsEmpty?: boolean };
export type Rect = { X: number; Y: number; Width: number; Height: number };
export type Color = string;

// Font related types
export type FontInfo = {
  m_family: string;
  m_font_size_px: number;
};

export type Font = {
  m_font_category: string;
  m_font_name: string;
  m_theme_family: string;
  m_style: number;
  m_base: FontInfo;
  m_arabic: FontInfo;
  m_cirilic: FontInfo;
  m_default_font?: FontInfo;
};

export type Background = {
  m_unique_id: number;
  m_dummyField?: string | null;
  m_theme_family?: string;
  m_local_index?: number;
  m_bg_category?: string;
  m_direction_type_bg?: string;
  m_theme_name?: string;
  m_permissions?: number;
  m_color_im_id?: Color | null;
  m_bg_opacity?: number;
  m_direction?: string;
  m_bg_childs_arr?: number[] | null;
  m_page_text_frames_names?: string[] | null;
  m_image_frames_names?: string[];
  m_font_name?: string | null;
};

export type Frame = {
  m_unique_id?: number;
  m_frame_name?: string;
  m_theme_family?: string;
  m_region_width_px?: number;
  m_region_frame_opacity?: number;
  m_region_image_or_color?: Color;
  m_font_color?: Color;
  m_font_opacity?: number;
  m_font_bg_image_or_color?: Color;
  m_font_bg_opacity?: number;
  m_container_frame_width_px?: number;
  m_container_frame_image_or_color?: Color;
  m_container_frame_opacity?: number;
  m_text_frame_opacity?: number;
  m_width_px?: number;
  m_frame_opacity?: number;
  m_image_or_color?: string;
};

export type Container = {
  ID: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ratio: number;
  family: string;
  m_origin: string;
};

// Layout related types
export type Layout = {
  m_ID: number;
  m_count: number;
  m_isSolid: boolean;
  m_containers: Container[];
  m_origin: string;
  m_baseID?: number;
  m_family?: string;
};

// Image related types
export type Image = {
  m_unique_id: number;
  m_medium_width_px: number;
  m_medium_height_px: number;
  m_alignment: number;
  m_orientation: string;
  m_faceRects: unknown | null;
  m_image_name: string;
  m_status: string;
  m_folderID: number;
  m_crop_rect: Rect;
  m_image_opacity: number;
  m_text: MText | null;
  m_isLocked: boolean;
};

export type MText = {
  m_X: number;
  m_Y: number;
  m_arabic: FontInfo;
  m_base: FontInfo;
  m_cirilic: FontInfo;
  m_default_font: FontInfo;
  m_direction: string;
  m_height: number;
  m_int_style: number;
  m_text_left_X: number;
  m_text_rotation: number;
  m_text_str: string;
  m_text_top_Y: number;
  m_width: number;
 m_vertcal_alignment?: string;
};

export type TextboxFrame = {
  m_width_px: number;
  m_frame_opacity: number;
  m_image_or_color: string;
  m_text_frame_opacity: number;
};
// Folder related types
export type Folder = {
  m_type: string;
  m_parent_folder: null;
  m_folderID: number;
  m_isLocked: boolean;
  m_rotation_deg: number;
  m_hide_text: boolean;
  m_size: string;
  m_pivot: Point;
  m_pivot_pos: string;
  m_background: Background | null;
  m_textbox: Textbox | null;
  m_layoutID: number;
  m_child_folders: (Folder | null)[] | null;
  m_folder_frame: TextboxFrame | null;
  m_textbox_frame: TextboxFrame | null;
};

export type Textbox = {
  m_font_opacity: number;
  m_font_color: string;
  m_text_bg_color: string;
  m_text_bg_opacity: number;
};

// Text related types
export type Text = {
  m_folderID: number;
  m_text: {
    m_text_left_X: number;
    m_text_top_Y: number;
    m_text_rotation: number;
    m_base: FontInfo;
    m_arabic: FontInfo;
    m_cirilic: FontInfo;
    m_default_font: FontInfo;
    m_int_style: number;
    m_direction: string;
    m_text_str: string;
    m_X: number;
    m_Y: number;
    m_width: number;
    m_height: number;
  };
  m_textbox_horizontal_alignment: string;
  m_textbox_vertical_alignment: string;
  m_isLocked: boolean;
};

// Main types
export type AlbumSubTree = {
  m_subtree_type: string;
  m_spread_folders: Folder[];
  m_tree_tmages: Image[];
  m_tree_texts: Text[];
  m_url_information: { m_folderID: number; m_urlInfo: string }[];
  m_next_folderID: number;
  m_additionalInfo: {
    m_themeName: string;
    m_coverName: string;
    m_coverFamily: string;
    m_folderID: number;
  }[];
};

export type TreeV5 = {
  M_VERSION: number;
  m_cover_type: string;
  m_master_id: number;
  m_album_token: string;
  m_album_name: string;
  m_book_type: string;
  m_album_direction: string;
  m_cover_theme: string;
  m_cover_family: string;
  m_album_theme: string;
  m_format: number;
  m_DPI: number;
  m_minimalDPI: number;
  m_cover_subtree: AlbumSubTree;
  m_book_subtree: AlbumSubTree;
  m_creationTime?: string;
};

export type TreeV5Resources = {
  m_intVersion: number;
  m_spine: number;
  m_treeV5Format: {
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
    m_textContainers: string[];
    m_textContainers_layflat: string[];
    m_page_title_len_max: number;
    m_page_title_len_lf_max: number;
    m_information_pos: string;
    m_image_text_center_threshold: number;
    m_percent_padd_bg_rect_height: number;
    m_precent_padd_left_right: number;
    m_precent_padd_solid_left_right: number;
    m_padd_solid_for_thickness_PX: number;
  };
  m_cover_resources: {
    m_layout_count: number;
    m_layout_set2_count: number;
    m_bg_resources: unknown | null;
    m_fonts_resources: Font[];
    m_frames_resources: unknown | null;
    m_layouts_for_album: unknown | null;
    m_layouts_for_album_Set2: unknown | null;
  };
  m_album_resources: {
    m_layout_count: number;
    m_layout_set2_count: number;
    m_bg_resources: Background[];
    m_fonts_resources: Font[];
    m_frames_resources: Frame[];
    m_layouts_for_album: Layout[];
    m_layouts_for_album_Set2: Layout[];
  };
};

export type PhotoAlbum = {
  m_version: number;
  m_isValid: boolean;
  m_errorStruct: {
    errorCode: number;
    errorMessage: string;
    value: unknown | null;
    TAG: unknown | null;
  };
  m_treeV5: TreeV5;
  m_treeV5Resources: TreeV5Resources;
  m_infoStringPosition?: string;
  m_infoCoverPosition?: string;
};

type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

export type TreeV5SubtreeKey = KeysOfType<TreeV5, AlbumSubTree>;

export function getAlbumName(album: PhotoAlbum): string {
  return album.m_treeV5.m_album_name;
}

export function getAlbumDirection(album: PhotoAlbum): string {
  return album.m_treeV5.m_album_direction;
}

export function getCoverTheme(album: PhotoAlbum): string {
  return album.m_treeV5.m_cover_theme;
}

export function getAlbumTheme(album: PhotoAlbum): string {
  return album.m_treeV5.m_album_theme;
}

export function getSpreadFolders(album: PhotoAlbum): Folder[] {
  return album.m_treeV5.m_book_subtree.m_spread_folders;
}

export function getImages(album: PhotoAlbum): Image[] {
  return album.m_treeV5.m_book_subtree.m_tree_tmages;
}

export function getTexts(album: PhotoAlbum): Text[] {
  return album.m_treeV5.m_book_subtree.m_tree_texts;
}

export function getLayouts(album: PhotoAlbum): Layout[] {
  return album.m_treeV5Resources.m_album_resources.m_layouts_for_album;
}

export function getFonts(album: PhotoAlbum): Font[] {
  return album.m_treeV5Resources.m_album_resources.m_fonts_resources;
}

export function getBackgrounds(album: PhotoAlbum): Background[] {
  return album.m_treeV5Resources.m_album_resources.m_bg_resources;
}

export function getFrames(album: PhotoAlbum): Frame[] {
  return album.m_treeV5Resources.m_album_resources.m_frames_resources;
}

export function getImageById(album: PhotoAlbum, id: number): Image | undefined {
  return getImages(album).find((image) => image.m_unique_id === id);
}

export function getFolderById(
  album: PhotoAlbum,
  id: number
): Folder | undefined {
  const folders = getSpreadFolders(album);
  for (const folder of folders) {
    const foundFolder = findFolderById(folder, id);
    if (foundFolder) return foundFolder;
  }
  return undefined;
}

export function findFolderById(folder: Folder, id: number): Folder | undefined {
  if (folder.m_folderID === id) return folder;
  if (folder.m_child_folders) {
    for (const childFolder of folder.m_child_folders) {
      if (childFolder) {
        const foundFolder = findFolderById(childFolder, id);
        if (foundFolder) return foundFolder;
      }
    }
  }
  return undefined;
}

export function getTextById(album: PhotoAlbum, id: number): Text | undefined {
  return getTexts(album).find((text) => text.m_folderID === id);
}
