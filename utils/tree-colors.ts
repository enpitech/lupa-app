/**
 * Utilities for resolving colors from the album tree data.
 *
 * Tree colors are stored with an alpha-channel prefix (e.g. `#FF000000`).
 * `cleanColor` strips the prefix so they can be used directly in styles.
 */

import type { Folder, PhotoAlbum } from '@/types/tree';

export type ResolvedTextStyle = {
  textColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
};

/**
 * Converts a tree color value (`#FFRRGGBB` or `#00RRGGBB`) into a standard
 * hex color (`#RRGGBB`).  Matches the web implementation in
 * `lib/TreeV5/utils/layouts.ts`.
 */
export function cleanColor(color: string | undefined): string {
  if (!color) return '';
  return color.replace('#FF', '#').replace('#00', '#');
}

/**
 * Appends an alpha channel to a hex color.
 * Matches the web pattern: `${cleanColor(frameColor)}${opacity_hex}`.
 */
export function applyAlpha(hexColor: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hexColor}${alpha}`;
}

/**
 * Resolves the text style for a TEXT_TYPE folder (page title) by looking up
 * the page's background → frame name → frame resource with font colors.
 *
 * Mirrors the web flow: `getPageTitleResources` → `selectBackgroundForTitle`
 * → `layoutStore.getFrameByName`.
 */
export function resolvePageTextStyle(
  pageFolder: Folder,
  album: PhotoAlbum
): ResolvedTextStyle {
  const backgroundId = pageFolder.m_background?.m_unique_id ?? 0;
  const resources = album.m_treeV5Resources.m_album_resources;

  // Find the background resource that matches this page's background
  const bgResource = resources.m_bg_resources?.find(
    (bg) => bg.m_unique_id === backgroundId
  );

  const frameName = bgResource?.m_page_text_frames_names?.[0];
  if (!frameName) {
    return { textColor: '#000', backgroundColor: '', backgroundOpacity: 0 };
  }

  // Look up the frame by name to get font color
  const frame = resources.m_frames_resources?.find(
    (f) => f.m_frame_name === frameName
  );

  return {
    textColor: cleanColor(frame?.m_font_color) || '#000',
    backgroundColor: cleanColor(frame?.m_font_bg_image_or_color) || '',
    backgroundOpacity: frame?.m_font_bg_opacity ?? 0,
  };
}

/**
 * Resolves the text style for a TITLE_TYPE folder (cover title) directly
 * from the folder's `m_textbox`.
 *
 * Mirrors the web flow in `useCoverProcessing.ts` / `LayoutSlotRenderer`.
 */
export function resolveTitleTextStyle(folder: Folder): ResolvedTextStyle {
  const textbox = folder.m_textbox;
  return {
    textColor: cleanColor(textbox?.m_font_color) || '#000',
    backgroundColor: cleanColor(textbox?.m_text_bg_color) || '',
    backgroundOpacity: textbox?.m_text_bg_opacity ?? 0,
  };
}
