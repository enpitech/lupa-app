import {
  Background,
  Folder,
  Font,
  Frame,
  Image,
  Layout,
  PhotoAlbum,
  Text,
} from '@/types/tree';
import { findFolderByPageId } from './album';
import { createBackgroundFromFrame } from '@/utils/editor/backgroundUtils';
import { usePageTitleStore } from '@/stores/pageTitle';
import useLayoutTreeStore from '@/stores/layout';
import { produce } from 'immer';
import { getLayoutFamilyByLayoutId } from './layouts';
import { folderMtypeEnum } from '@/utils/appConst';

export function getFontResources(): Font {
  return (
    useLayoutTreeStore.getState().albumResources.m_album_resources
      .m_fonts_resources?.[1] || {}
  );
}

export function getDestinationFolder(album: PhotoAlbum, pageId: number) {
  const { m_spread_folders: spreadFolders } = album.m_treeV5.m_book_subtree;
  return findFolderByPageId(spreadFolders, pageId);
}

export function applyTextBoxProperties(
  destinationFolder: Folder,
  imageId: number | string
) {
  const background = getBackgroundResource(destinationFolder);
  if (!background) return;

  const frameProperties = getFrameProperties(background);
  if (!frameProperties) return;

  // Check if this is a Magazine layout
  const layoutFamily = getLayoutFamilyByLayoutId(destinationFolder.m_layoutID);
  const isMagazineLayout = layoutFamily === 'MAGAZINE';

  const bgTextFrame = selectBackgroundForTitle(
    useLayoutTreeStore.getState().albumResources.m_album_resources,
    false,
    background.m_unique_id
  );

  const layoutStore = useLayoutTreeStore.getState();
  const frameFrameName = bgTextFrame?.m_page_text_frames_names?.[0];
  const pageTextFrame = frameFrameName
    ? layoutStore.getFrameByName(frameFrameName)
    : undefined;

  const imageFolder = findImageFolder(destinationFolder, imageId);
  if (!imageFolder) return;

  imageFolder.m_textbox = {
    m_font_opacity: frameProperties.m_font_opacity ?? 1,
    m_font_color:
      isMagazineLayout && pageTextFrame?.m_font_color
        ? pageTextFrame.m_font_color
        : frameProperties.m_font_color || '#000000',
    m_text_bg_color: frameProperties.m_font_bg_image_or_color ?? '#ffffff',
    m_text_bg_opacity: isMagazineLayout
      ? 0
      : frameProperties.m_font_bg_opacity ?? 1,
    ...(isMagazineLayout && { m_vertical_alignment: 'BELOW' }),
  };
  if (isMagazineLayout && imageFolder?.m_folder_frame) {
    imageFolder.m_folder_frame.m_frame_opacity = 0;
  }

  imageFolder.m_textbox_frame = {
    m_width_px: frameProperties.m_container_frame_width_px ?? 1,
    m_frame_opacity: isMagazineLayout
      ? 0
      : frameProperties.m_container_frame_opacity ?? 1,
    m_image_or_color:
      frameProperties.m_container_frame_image_or_color ?? '#000000',
    m_text_frame_opacity: frameProperties.m_text_frame_opacity ?? 1,
  };
}

export function applyFolderFrameProperties(
  destinationFolder: Folder,
  imageId: number | string
) {
  const background = getBackgroundResource(destinationFolder);
  if (!background) return;

  const frameProperties = getFrameProperties(background);
  if (!frameProperties) return;

  const imageFolder = findImageFolder(destinationFolder, imageId);
  if (!imageFolder) return;

  const layoutFamily = getLayoutFamilyByLayoutId(destinationFolder.m_layoutID);
  const isMagazineLayout = layoutFamily === 'MAGAZINE';

  imageFolder.m_folder_frame = {
    m_width_px: frameProperties.m_container_frame_width_px ?? 1,
    m_frame_opacity: isMagazineLayout ? 0 : (frameProperties.m_container_frame_opacity ?? 1),
    m_image_or_color:
      frameProperties.m_container_frame_image_or_color ?? '#000000',
    m_text_frame_opacity: frameProperties.m_text_frame_opacity ?? 1,
  };
}

export function getBackgroundResource(destinationFolder: Folder) {
  const albumResources =
    useLayoutTreeStore.getState().albumResources.m_album_resources;
  // Safety check for album resources structure
  if (!albumResources?.m_bg_resources) {
    return undefined;
  }

  // First try to find by m_unique_id (exact match)
  const found = albumResources.m_bg_resources.find(
    (bg) => bg.m_unique_id === destinationFolder?.m_background?.m_unique_id
  );

  if (found) {
    return found;
  }

  // Fallback: search by m_color_im_id if m_unique_id search failed
  const fallbackByColorId = albumResources.m_bg_resources.find(
    (bg) => bg.m_color_im_id === destinationFolder?.m_background?.m_color_im_id
  );

  if (fallbackByColorId) {
    console.warn(
      `Background not found by unique_id (${destinationFolder?.m_background?.m_unique_id}), using fallback by color_im_id (${destinationFolder?.m_background?.m_color_im_id})`
    );
    return fallbackByColorId;
  }

  // Final fallback: use first available background
  const firstAvailable = albumResources.m_bg_resources[0];
  if (firstAvailable) {
    console.warn(
      `Background not found by unique_id (${destinationFolder?.m_background?.m_unique_id}) or color_im_id (${destinationFolder?.m_background?.m_color_im_id}), using first available background (${firstAvailable.m_unique_id})`
    );
    return firstAvailable;
  }

  return undefined;
}

export function getFrameProperties(background: Background) {
  const layoutStore = useLayoutTreeStore.getState();
  const framesResources = layoutStore.getFramesResources();

  return framesResources.find(
    (frame) => frame.m_frame_name === background?.m_image_frames_names?.[0]
  );
}

export function findImageFolder(
  destinationFolder: Folder,
  imageId: number | string
) {
  return destinationFolder?.m_child_folders?.find(
    (folder) => folder?.m_folderID === imageId
  );
}

type SupportedLanguage = 'hebrew' | 'arabic' | 'russian' | 'english';

export function setFontProperties(
  images: Image[],
  index: number,
  fonts: Font,
  language: SupportedLanguage,
  text: string,
  isMagazineLayout: boolean
) {
  if (!text) {
    images[index].m_text = null;
    return;
  }
  images[index].m_text = {
    m_X: 0,
    m_Y: 0,
    m_arabic: fonts.m_arabic,
    m_base: fonts.m_base,
    m_cirilic: fonts.m_cirilic,
    m_default_font: { m_family: 'Open Sans', m_font_size_px: 65 },
    m_direction: getDirection(language),
    m_height: 0,
    m_int_style: 0,
    m_text_left_X: 0,
    m_text_rotation: 0,
    m_text_str: text,
    m_text_top_Y: 0,
    m_width: 0,
    m_vertcal_alignment: isMagazineLayout ? 'BELOW' : undefined,
  };
}

const typesOfLanguages: Record<SupportedLanguage, RegExp> = {
  hebrew: /[\u0590-\u05FF]/,
  arabic: /[\u0600-\u06FF]/,
  russian: /[\u0400-\u04FF]/,
  english: /[a-zA-Z]/,
};

export function detectLanguage(text: string): SupportedLanguage {
  const firstChar = text.trim().charAt(0);
  if (typesOfLanguages.hebrew.test(firstChar)) return 'hebrew';
  if (typesOfLanguages.arabic.test(firstChar)) return 'arabic';
  if (typesOfLanguages.russian.test(firstChar)) return 'russian';
  if (typesOfLanguages.english.test(firstChar)) return 'english';
  return 'hebrew';
}

export function getDirection(lang: SupportedLanguage): 'RTL' | 'LTR' {
  return lang === 'russian' || lang === 'english' ? 'LTR' : 'RTL';
}

const DEFAULT_TITLE_CONTAINER_SIZE = '2312, 231';

interface TitleTheme {
  uniqueId: number;
  frameName: string;
  themeFamily: string;
  regionWidthPx: number;
  regionFrameOpacity: number;
  regionImageOrColor: string;
  fontColor: string;
  fontOpacity: number;
  fontBgImageOrColor: string;
  fontBgOpacity: number;
  containerFrameWidthPx: number;
  containerFrameImageOrColor: string;
  containerFrameOpacity: number;
  textFrameOpacity: number;
}

interface PageTitleResources {
  nextFolderId: number;
  pageTextFrame: Frame | undefined;
  bgTextFrame: Background | undefined;
  textContainers: number[] | undefined;
  truncatedTitle: string;
  albumResources: {
    m_layout_count: number;
    m_layout_set2_count: number;
    m_bg_resources: Background[];
    m_fonts_resources: Font[];
    m_frames_resources: Frame[];
    m_layouts_for_album: Layout[];
    m_layouts_for_album_Set2: Layout[];
  };
}

export function selectBackgroundForTitle(
  albumResources: PageTitleResources['albumResources'],
  isLayflat: boolean,
  backgroundId: number
): Background | undefined {
  let bgTextFrame;
  const background = albumResources?.m_bg_resources?.find(
    (bg) => bg.m_unique_id === backgroundId
  );
  // Added the includes 'inner' for hagaddah books
  if (
    background?.m_page_text_frames_names?.some(
      (name) => name.includes('title') || name.includes('inner')
    )
  ) {
    return background;
  }

  // Set to false will disable the functionality temporarly
  usePageTitleStore.getState().setIsBackgroundChange(false);

  if (isLayflat) {
    const layFlatBackgrounds =
      albumResources?.m_bg_resources?.filter(
        (bg) =>
          bg.m_bg_category === 'LAYFLAT_BG' &&
          bg.m_page_text_frames_names?.some((name) =>
            name.toLowerCase().includes('pagetitle')
          )
      ) || [];

    if (layFlatBackgrounds.length > 0) {
      const randomIndex = Math.floor(Math.random() * layFlatBackgrounds.length);
      bgTextFrame = layFlatBackgrounds[randomIndex];
    }
  } else {
    const rightPageBackgrounds =
      albumResources?.m_bg_resources?.filter(
        (bg) =>
          bg.m_bg_category === 'RIGHT_PAGE_BG' &&
          bg.m_page_text_frames_names?.some((name) =>
            name.toLowerCase().includes('pagetitle')
          )
      ) || [];

    if (rightPageBackgrounds.length > 0) {
      const randomRightIndex = Math.floor(
        Math.random() * rightPageBackgrounds.length
      );
      const rightBackground = rightPageBackgrounds[randomRightIndex];

      if (rightBackground.m_bg_childs_arr) {
        const compatibleLeftBackgrounds =
          albumResources?.m_bg_resources?.filter(
            (bg) =>
              bg.m_local_index !== undefined &&
              rightBackground.m_bg_childs_arr?.includes(bg.m_local_index) &&
              bg.m_bg_category !== 'LAYFLAT_BG' &&
              bg.m_page_text_frames_names?.some((name) =>
                name.toLowerCase().includes('pagetitle')
              )
          ) || [];

        if (compatibleLeftBackgrounds.length > 0) {
          const randomLeftIndex = Math.floor(
            Math.random() * compatibleLeftBackgrounds.length
          );
          bgTextFrame = compatibleLeftBackgrounds[randomLeftIndex];
        }
      }
    }
  }

  if (!bgTextFrame) {
    bgTextFrame = albumResources?.m_bg_resources?.find((frame) =>
      frame.m_page_text_frames_names?.some((name) =>
        name.toLowerCase().includes('title')
      )
    );
  }

  return bgTextFrame;
}

export function getPageTitleResources(
  album: PhotoAlbum,
  isLayflat: boolean,
  title: string,
  backgroundId: number = 0,
  readOnly: boolean = false
): PageTitleResources {
  const nextFolderId = readOnly
    ? album.m_treeV5.m_book_subtree.m_next_folderID || 1
    : album.m_treeV5.m_book_subtree.m_next_folderID++;

  const treeV5Resources = useLayoutTreeStore.getState().albumResources;
  const treeV5Format = treeV5Resources?.m_treeV5Format;
  const albumResources = treeV5Resources?.m_album_resources;

  const bgTextFrame = selectBackgroundForTitle(
    albumResources,
    isLayflat,
    backgroundId
  );

  const layoutStore = useLayoutTreeStore.getState();
  const frameFrameName = bgTextFrame?.m_page_text_frames_names?.[0];
  const pageTextFrame = frameFrameName
    ? layoutStore.getFrameByName(frameFrameName)
    : undefined;

  const textContainers = isLayflat
    ? treeV5Format?.m_textContainers_layflat?.[0]?.split(', ').map(Number)
    : treeV5Format?.m_textContainers?.[0]?.split(', ').map(Number);

  const maxTitleLength = isLayflat
    ? treeV5Format?.m_page_title_len_lf_max || 40
    : treeV5Format?.m_page_title_len_max || 40;

  const truncatedTitle =
    title.length > maxTitleLength ? title.substring(0, maxTitleLength) : title;

  return {
    nextFolderId,
    pageTextFrame,
    bgTextFrame,
    textContainers,
    truncatedTitle,
    albumResources,
  };
}

const cleanColor = (color: string | undefined) =>
  color?.replace('#00', '#').replace('#FF', '#') || '';

export function getTitleTheme(
  backgroundId: number = 0
): TitleTheme | undefined {
  const layoutStore = useLayoutTreeStore.getState();
  const foundResource = layoutStore.getFrameById(backgroundId);

  if (!foundResource) {
    console.error('Frame foundResource not found in layout store');
    return undefined;
  }

  return {
    uniqueId: foundResource.m_unique_id || 0,
    frameName: foundResource.m_frame_name || '',
    themeFamily: foundResource.m_theme_family || '',
    regionWidthPx: foundResource.m_region_width_px || 0,
    regionFrameOpacity: foundResource.m_region_frame_opacity || 0,
    regionImageOrColor: cleanColor(foundResource.m_region_image_or_color),
    fontColor: cleanColor(foundResource.m_font_color),
    fontOpacity: foundResource.m_font_opacity || 1,
    fontBgImageOrColor: cleanColor(foundResource.m_font_bg_image_or_color),
    fontBgOpacity: foundResource.m_font_bg_opacity || 0,
    containerFrameWidthPx: foundResource.m_container_frame_width_px || 0,
    containerFrameImageOrColor: cleanColor(
      foundResource.m_container_frame_image_or_color
    ),
    containerFrameOpacity: foundResource.m_container_frame_opacity || 0,
    textFrameOpacity: foundResource.m_text_frame_opacity || 0,
  };
}

export function createTitleFolder(
  targetPageIdElements: Folder,
  pageTextFrame: Frame | undefined,
  textContainers: number[] | undefined,
  nextFolderId: number
): Folder {
  return {
    m_type: folderMtypeEnum.TEXT_TYPE,
    m_folderID: nextFolderId,
    m_isLocked: false,
    m_rotation_deg: 0,
    m_hide_text: false,
    m_size:
      textContainers && textContainers.length >= 4
        ? `${textContainers[2]}, ${textContainers[3]}`
        : DEFAULT_TITLE_CONTAINER_SIZE,
    m_pivot: {
      IsEmpty: false,
      X:
        textContainers && textContainers.length >= 2
          ? textContainers[0] + textContainers[2] / 2
          : targetPageIdElements.m_pivot?.X || 0,
      Y:
        textContainers && textContainers.length >= 2
          ? textContainers[1] + textContainers[3] / 2
          : targetPageIdElements.m_pivot?.Y
          ? targetPageIdElements.m_pivot.Y + 1000
          : 3318,
    },
    m_pivot_pos: 'CENTER_PVT',
    m_background: createBackgroundFromFrame(pageTextFrame),

    m_folder_frame: pageTextFrame
      ? {
          m_width_px: pageTextFrame.m_container_frame_width_px || 0,
          m_frame_opacity: pageTextFrame.m_container_frame_opacity || 1,
          m_image_or_color:
            pageTextFrame.m_container_frame_image_or_color || '#FF000000',
          m_text_frame_opacity: pageTextFrame.m_text_frame_opacity || 0,
        }
      : null,
    m_textbox_frame: pageTextFrame
      ? {
          m_width_px: pageTextFrame.m_container_frame_width_px || 0,
          m_frame_opacity: pageTextFrame.m_container_frame_opacity || 1,
          m_image_or_color:
            pageTextFrame.m_container_frame_image_or_color || '#FF000000',
          m_text_frame_opacity: pageTextFrame.m_text_frame_opacity || 0,
        }
      : null,
    m_textbox: {
      m_font_color: pageTextFrame?.m_font_color || '#FF000000',
      m_font_opacity: pageTextFrame?.m_font_opacity ?? 1,
      m_text_bg_color: pageTextFrame?.m_font_bg_image_or_color || '#00000000',
      m_text_bg_opacity: pageTextFrame?.m_font_bg_opacity ?? 0,
    },
    m_layoutID: 0,
    m_child_folders: null,
    m_parent_folder: null,
  };
}

export function addTitleFolderToPage(
  targetPageIdElements: Folder,
  titleFolder: Folder
): void {
  if (targetPageIdElements.m_child_folders) {
    targetPageIdElements.m_child_folders.push(titleFolder);
  } else {
    targetPageIdElements.m_child_folders = [titleFolder];
  }
}

export function addTitleText(
  treeTexts: Text[],
  folderId: number,
  title: string,
  albumResources: PageTitleResources['albumResources']
): void {
  const fontsResources = albumResources?.m_fonts_resources || [];
  const pageFonts = fontsResources.find(
    (font) => font.m_font_category === 'PAGE'
  );
  const detectedLanguage = detectLanguage(title);
  const textDirection = getDirection(detectedLanguage);

  treeTexts.push({
    m_folderID: folderId,
    m_text: {
      m_text_left_X: 0,
      m_text_top_Y: 0,
      m_text_rotation: 0,
      m_base: {
        m_family: pageFonts?.m_base?.m_family || 'Open Sans',
        m_font_size_px: pageFonts?.m_base?.m_font_size_px || 65,
      },
      m_arabic: {
        m_family: pageFonts?.m_arabic?.m_family || 'Open Sans',
        m_font_size_px: pageFonts?.m_arabic?.m_font_size_px || 83,
      },
      m_cirilic: {
        m_family: pageFonts?.m_cirilic?.m_family || 'Open Sans',
        m_font_size_px: pageFonts?.m_cirilic?.m_font_size_px || 65,
      },
      m_default_font: {
        m_family: pageFonts?.m_default_font?.m_family || 'Open Sans',
        m_font_size_px: pageFonts?.m_default_font?.m_font_size_px || 65,
      },
      m_int_style: 0,
      m_direction: textDirection,
      m_text_str: title,
      m_X: 0,
      m_Y: 0,
      m_width: 0,
      m_height: 0,
    },
    m_textbox_horizontal_alignment: 'MIDDLE',
    m_textbox_vertical_alignment: 'CENTER',
    m_isLocked: false,
  });
}

export function removePageTitle(album: PhotoAlbum, pageId: number): PhotoAlbum {
  if (!album) return album;

  return produce(album, (draft) => {
    const spreads = draft.m_treeV5.m_book_subtree.m_spread_folders || [];
    const targetFolder = findFolderByPageId(spreads, pageId);

    if (!targetFolder) return;

    if (targetFolder.m_child_folders) {
      const titleFoldersToRemove: number[] = [];

      targetFolder.m_child_folders.forEach((folder: Folder | null) => {
        if (folder && folder.m_type === folderMtypeEnum.TEXT_TYPE) {
          titleFoldersToRemove.push(folder.m_folderID);
        }
      });

      targetFolder.m_child_folders = targetFolder.m_child_folders.filter(
        (folder: Folder | null) =>
          !(folder && folder.m_type === folderMtypeEnum.TEXT_TYPE)
      );

      if (titleFoldersToRemove.length > 0) {
        draft.m_treeV5.m_book_subtree.m_tree_texts =
          draft.m_treeV5.m_book_subtree.m_tree_texts.filter(
            (text) => !titleFoldersToRemove.includes(text.m_folderID)
          );
      }
    }
  });
}
