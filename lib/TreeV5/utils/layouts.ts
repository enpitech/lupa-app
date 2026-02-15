import {
  Container,
  Folder,
  Image,
  Layout,
  PhotoAlbum,
  Rect,
} from '@/types/tree';
import { SlotPositioning } from '@/types/editor';
import useLayoutTreeStore from '@/stores/layout';
import { CSSProperties } from 'react';
import { findFolderByPageId } from '@/lib/TreeV5/utils/album';
import useAlbumTreeStore from '@/stores/albumTree';
import { PinturaImageState } from '@pqina/pintura';
import { getRadiansFromOrientation } from '@/stores/albumTree/action/imageOrientation';
import { applyTextBoxProperties, getFrameProperties } from './text';
import { folderMtypeEnum } from '@/utils/appConst';
import { validateAndFixCropRect } from '@/lib/utils/albumUtils';

// Layout family types
export enum LayoutFamily {
  REGULAR = 'REGULAR', // For families A and B
  MAGAZINE = 'MAGAZINE', // For family C
}

export type LayoutFamilyType = 'REGULAR' | 'MAGAZINE';

interface LayoutState {
  layoutDimensions: {
    width: number;
    height: number;
  };
  pageIds: number[];
  imagesMap: Record<number, Image>;
  layoutElements: { layout: Folder | null; layoutImage: Folder[] }[];
  isNeedToCutBleed: boolean;
}

interface CropDimensionParams {
  originalWidth: number;
  mediumWidth: number;
  mediumHeight: number;
  targetWidth: number;
  targetHeight: number;
  minRes: number;
  treeRes: number;
}

interface CropDimensions {
  width: number;
  height: number;
}

/**
 * Determines layout family based on layout properties
 * TODO: Update this with actual business logic for family detection
 */
export function detectLayoutFamily(layout: Layout): LayoutFamilyType {
  // If the layout has explicit family information, use it
  if (layout.m_family) {
    return layout.m_family === 'C'
      ? LayoutFamily.MAGAZINE
      : LayoutFamily.REGULAR;
  }

  // Temporary detection logic based on layout ID patterns
  // This should be replaced with actual business rules

  // For demonstration: assume layouts with IDs > 3000 are Magazine type
  // You should replace this with your actual family detection logic
  if (layout.m_ID > 3000) {
    return LayoutFamily.MAGAZINE;
  }

  // Default to REGULAR for families A and B
  return LayoutFamily.REGULAR;
}

/**
 * Gets the layout family for a given page ID
 */
export function getLayoutFamilyByPageId(
  album: PhotoAlbum | null,
  pageId: number
): LayoutFamilyType | null {
  if (!album?.m_treeV5?.m_book_subtree?.m_spread_folders) return null;

  // Find the page folder
  const spreadFolders = album.m_treeV5.m_book_subtree.m_spread_folders;
  const pageFolder = findFolderByPageId(spreadFolders, pageId);

  if (!pageFolder?.m_child_folders) return null;

  // Get the first child's layout ID (assuming all children share same layout family)
  const firstChild = pageFolder.m_child_folders.find(
    (child) => child?.m_layoutID
  );
  if (!firstChild?.m_layoutID) return null;

  return getLayoutFamilyByLayoutId(firstChild.m_layoutID);
}

/**
 * Gets layout family by layout ID
 */
export function getLayoutFamilyByLayoutId(
  layoutId: number
): LayoutFamilyType | null {
  const albumResources =
    useLayoutTreeStore.getState().albumResources.m_album_resources;

  const layouts = [
    ...(albumResources?.m_layouts_for_album_Set2 ?? []),
    ...(albumResources?.m_layouts_for_album ?? []),
  ];

  if (!layouts) return null;

  const layout = layouts.find((layout) => layout.m_ID === layoutId);

  if (!layout) return null;

  return detectLayoutFamily(layout);
}

/**
 * Check if album has any Magazine layouts (family "C")
 * Used to determine if API requests need layout: 'layout_c' parameter
 */
export function albumHasMagazineLayouts(): boolean {
  const albumResources =
    useLayoutTreeStore.getState().albumResources.m_album_resources;

  const layouts = [
    ...(albumResources?.m_layouts_for_album_Set2 ?? []),
    ...(albumResources?.m_layouts_for_album ?? []),
  ];

  if (layouts.length === 0) return false;

  return layouts.some((layout) => {
    // Check explicit family field first
    if (layout.m_family === 'C') {
      return true;
    }
    // Fallback to ID-based detection
    return detectLayoutFamily(layout) === LayoutFamily.MAGAZINE;
  });
}

export function getLayoutState(layout: Folder, images: Image[]): LayoutState {
  if (!layout)
    return {
      layoutDimensions: { width: 0, height: 0 },
      imagesMap: {},
      pageIds: [],
      layoutElements: [
        {
          layout: null,
          layoutImage: [],
        },
      ],
      isNeedToCutBleed: false,
    };
  const [width, height] = layout.m_size.split(',').map(Number);
  const firstChild = layout.m_child_folders?.[0] ?? null;
  const secondChild = layout.m_child_folders?.[1] ?? null;
  const pageIds = [
    firstChild?.m_folderID ?? 0,
    secondChild?.m_folderID ?? 0,
  ].filter((id) => id !== 0);

  const layoutElementsArray = new Array<{
    layout: Folder | null;
    layoutImage: Folder[];
  }>();

  // TODO: Comment out wtf is going on here
  if (firstChild) {
    layoutElementsArray.push({
      layout: firstChild,
      layoutImage:
        firstChild.m_child_folders?.filter(
          (folder): folder is Folder => folder !== null
        ) ?? [],
    });
  }
  // TODO: Comment out wtf is going on here
  if (secondChild) {
    layoutElementsArray?.push({
      layout: secondChild,
      layoutImage:
        secondChild.m_child_folders?.filter(
          (folder): folder is Folder => folder !== null
        ) ?? [],
    });
  }

  const imagesMap = images.reduce<Record<number, Image>>((acc, image) => {
    const isInLayout = layoutElementsArray.some((layoutElements) =>
      layoutElements?.layoutImage?.some(
        (folder: Folder) => folder?.m_folderID === image.m_folderID
      )
    );

    if (isInLayout) {
      acc[image.m_folderID] = image;
    }

    return acc;
  }, {});

  return {
    layoutDimensions: { width, height },
    imagesMap,
    pageIds,
    layoutElements: layoutElementsArray,
    isNeedToCutBleed: false,
  };
}

export const parseSizeLayout = (
  size: string | undefined
): { width: number; height: number } => {
  const [width, height] = (size || '0,0').split(',');
  return { width: parseInt(width), height: parseInt(height) };
};

export function processLayouts(layouts: Layout[]) {
  const groupByCount: Record<number, Layout[]> = {};
  const keyValueLayouts: Record<number, Layout> = {};
  let maxCount = 0;

  layouts.forEach((layout) => {
    const count = layout.m_count;
    if (!groupByCount[count]) {
      groupByCount[count] = [];
    }
    groupByCount[count].push(layout);
    keyValueLayouts[layout.m_ID] = layout;
    if (count > maxCount) {
      maxCount = count;
    }
  });

  return { groupByCount, keyValueLayouts, maxCount };
}

export function getRandomLayout(
  count: number,
  groupMap: Record<number, Layout[]>
): Layout {
  const group = groupMap[count];
  return group[Math.floor(Math.random() * group.length)];
}

export const removeImageFromLayout = (
  pageIdElements: Folder,
  currentImageId: number | string,
  currentLayoutID: {
    m_count?: number;
    m_containers: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  },
  album: PhotoAlbum
) => {
  if (!pageIdElements || !currentLayoutID) return;
  const { m_child_folders } = pageIdElements;

  if (!m_child_folders) return null;

  if (m_child_folders?.length === 1) {
    if (m_child_folders[0]) {
      m_child_folders[0].m_folderID = 0;
      return;
    }
  }
  pageIdElements.m_child_folders = m_child_folders.filter(
    (item) => item?.m_folderID !== currentImageId
  );

  placeImageInNewLayout(currentLayoutID, pageIdElements, album);
};

export const updateImagesLayout = (
  pageIdElements: Folder,
  layout: {
    m_ID: number;
    m_containers: Array<{
      ID: number;
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  },
  imagesToupdate: Image[],
  emptyImagesToReset: boolean = true
) => {
  if (!pageIdElements || !layout) return;

  const imagesToReset: number[] = emptyImagesToReset
    ? []
    : [...useAlbumTreeStore.getState().imagesToReset];
  pageIdElements.m_child_folders?.forEach((item, imageIdx) => {
    if (!item || item.m_type === folderMtypeEnum.TEXT_TYPE) return;

    const container = layout.m_containers[imageIdx];
    if (!container) return;

    item.m_pivot = { X: container.x, Y: container.y };
    item.m_size = `${container.width},${container.height}`;
    item.m_layoutID = container.ID;

    imagesToReset.push(item.m_folderID);
    if (imagesToupdate?.length) {
      const matchingImages = imagesToupdate.filter(
        (image) => image.m_folderID === item.m_folderID
      );

      if (matchingImages.length > 0) {
        const image = matchingImages[0];

        const containerRatio = container.width / container.height;
        const imageRatio = getImageRatio(image);

        let cropX = 0;
        let cropY = 0;
        let cropWidth = 1;
        let cropHeight = 1;
        if (containerRatio > imageRatio) {
          cropHeight = imageRatio / containerRatio;
          cropY = (1 - cropHeight) / 2;
        } else {
          cropWidth = containerRatio / imageRatio;
          cropX = (1 - cropWidth) / 2;
        }

        if (!Number.isFinite(imageRatio) || imageRatio <= 0) {
          console.error(
            'Invalid imageRatio in layouts.ts/updateImagesLayout, value of',
            imageRatio
          );
        }
        if (!Number.isFinite(containerRatio) || containerRatio <= 0) {
          console.error(
            'Invalid containerRatio in layouts.ts/updateImagesLayout, value of',
            containerRatio
          );
        }
        const cropRect: Rect = {
          X: cropX,
          Y: cropY,
          Width: cropWidth,
          Height: cropHeight,
        };
        image.m_crop_rect = validateAndFixCropRect(
          cropRect,
          'layouts.ts/updateImagesLayout',
          image
        );

        // Preserve existing rotation if it exists, otherwise reset to normal
        const hasCustomRotation = image.m_orientation !== 'JPEG_NORMAL';
        if (!hasCustomRotation) {
          image.m_orientation = 'JPEG_NORMAL';
          image.m_alignment = 0;
        } else {
          image.m_alignment = 0;
        }
      }
    }
  });
  pageIdElements.m_layoutID = layout.m_ID;
  useAlbumTreeStore.getState().setImagesToReset(imagesToReset);
};

export const addImageToLayout = (
  pageIdElements: Folder,
  currentImageId: number | string,
  imgFrameColor: string,
  destLayoutID?: {
    m_count?: number;
    m_containers: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  },
  maxCountSpread?: number,
  album?: PhotoAlbum
): boolean => {
  if (
    destLayoutID?.m_count === undefined ||
    destLayoutID.m_count >= (maxCountSpread ?? 0)
  )
    return false;

  if (
    pageIdElements.m_child_folders?.length === 1 &&
    pageIdElements.m_child_folders[0]?.m_folderID === 0
  ) {
    pageIdElements.m_child_folders[0].m_folderID = Number(currentImageId);
    // Apply text properties when adding image to empty slot
    if (album) {
      applyTextBoxProperties(pageIdElements, Number(currentImageId));
    }
    return true;
  }
  const layout = useLayoutTreeStore
    .getState()
    .getRandomFromGroupBySpreadCount(destLayoutID.m_count + 1);

  if (!pageIdElements.m_child_folders) return false;

  updateImagesLayout(
    pageIdElements,
    layout,
    album?.m_treeV5.m_book_subtree.m_tree_tmages ?? []
  );

  pageIdElements.m_layoutID = layout.m_ID;

  addMissingImageToPage(
    destLayoutID.m_count,
    layout.m_count,
    layout.m_containers,
    pageIdElements,
    currentImageId,
    imgFrameColor,
    album
  );

  return true;
};

export const addMissingImageToPage = (
  currLayoutCount: number,
  destLayoutCount: number,
  destLayoutContainers: Container[],
  destPageIdElements: Folder,
  imageId: number | string | null = null,
  imgFrameColor: string,
  album?: PhotoAlbum
) => {
  if (!destPageIdElements.m_child_folders) {
    destPageIdElements.m_child_folders = [];
  }
  // Use the passed album (mutable) or fallback to store
  const workingAlbum = album || useAlbumTreeStore.getState().album;

  const newContainers = Array.from(
    { length: destLayoutCount - currLayoutCount },
    (_, index) => {
      const containerIndex = currLayoutCount + index;
      const newContainer = destLayoutContainers[containerIndex];
      if (!newContainer) return null;

      // Generate a unique folder ID for the new slot
      let slotId: number;
      if (imageId) {
        slotId = Number(imageId);
      } else if (workingAlbum) {
        // Use the album's next folder ID and increment it
        slotId = workingAlbum.m_treeV5.m_book_subtree.m_next_folderID++;
      } else {
        slotId = 0;
      }

      // Get the correct frame properties using layout ID
      let frameProperties = null;
      if (destPageIdElements.m_background) {
        frameProperties = getFrameProperties(destPageIdElements.m_background);
      }

      const layoutFamily = getLayoutFamilyByLayoutId(destPageIdElements.m_layoutID);
      const isMagazineLayout = layoutFamily === 'MAGAZINE';

      const newSlot = {
        // If imageId is provided, it's an IMAGE_TYPE, otherwise EMPTY_CONTAINER
        m_type: imageId
          ? folderMtypeEnum.IMAGE_TYPE
          : folderMtypeEnum.EMPTY_CONTAINER,
        m_parent_folder: null,
        m_folderID: slotId,
        m_isLocked: false,
        m_rotation_deg: 0,
        m_hide_text: false,
        m_size: `${newContainer.width ?? 0},${newContainer.height ?? 0}`,
        m_pivot: { X: newContainer.x ?? 0, Y: newContainer.y ?? 0 },
        m_pivot_pos: 'CENTER_PVT',
        m_background: null,
        m_textbox: null,
        m_layoutID: newContainer.ID,
        m_child_folders: [],
        // Use frame properties from layout resources if available, otherwise fallback to imgFrameColor
        // For magazine layouts, set frame opacity to 0 (no borders)
        m_folder_frame: {
          m_frame_opacity: isMagazineLayout ? 0 : (frameProperties?.m_container_frame_opacity ?? 1),
          m_image_or_color:
            frameProperties?.m_container_frame_image_or_color ?? imgFrameColor,
          m_text_frame_opacity: frameProperties?.m_text_frame_opacity ?? 0,
          m_width_px: frameProperties?.m_container_frame_width_px ?? 8,
        },

        m_textbox_frame: null,
      };

      return newSlot;
    }
  ).filter(Boolean);

  // Separate TEXT_TYPE elements from other elements to ensure TEXT_TYPE is always last
  const textElements =
    destPageIdElements.m_child_folders?.filter(
      (folder) => folder?.m_type === folderMtypeEnum.TEXT_TYPE
    ) || [];
  const nonTextElements =
    destPageIdElements.m_child_folders?.filter(
      (folder) => folder?.m_type !== folderMtypeEnum.TEXT_TYPE
    ) || [];

  // Rebuild the array with non-text elements first, then new containers, then text elements
  destPageIdElements.m_child_folders = [
    ...nonTextElements,
    ...newContainers,
    ...textElements,
  ];

  // Apply textbox properties to the new slots AFTER they've been added to the page structure
  if (workingAlbum) {
    newContainers.forEach((newSlot) => {
      if (newSlot && newSlot.m_folderID !== 0) {
        applyTextBoxProperties(destPageIdElements, newSlot.m_folderID);
      }
    });
  }
};
export function placeImageInNewLayout(
  currentLayoutID: {
    m_count?: number;
    m_containers: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>;
  },
  pageIdElements: Folder,
  album: PhotoAlbum
) {
  if (currentLayoutID.m_count === undefined || currentLayoutID.m_count <= 0)
    return;
  const newLayout = useLayoutTreeStore
    .getState()
    .getRandomFromGroupBySpreadCount(currentLayoutID.m_count - 1);

  pageIdElements.m_layoutID = newLayout.m_ID;

  if (!pageIdElements.m_child_folders) return;

  updateImagesLayout(
    pageIdElements,
    newLayout,
    album.m_treeV5.m_book_subtree.m_tree_tmages ?? []
  );
}

export function filterFoldersByType(layout: Folder, type: string): Folder[] {
  return (
    layout.m_child_folders?.filter(
      (folder): folder is Folder => folder !== null && folder.m_type === type
    ) ?? []
  );
}

function createLayoutElement(
  folder: Folder | null,
  childElements: Folder[]
): { layout: Folder | null; layoutImage: Folder[] } {
  if (!folder) {
    return { layout: null, layoutImage: [] };
  }

  const folderWithElements = {
    ...folder,
    m_child_folders: childElements,
  };

  return {
    layout: folderWithElements,
    layoutImage: childElements,
  };
}

function buildImagesMap(
  images: Image[],
  layoutElements: { layout: Folder | null; layoutImage: Folder[] }[]
): Record<number, Image> {
  return images.reduce<Record<number, Image>>((acc, image) => {
    const isInLayout = layoutElements.some((layoutElements) =>
      layoutElements?.layoutImage?.some(
        (folder: Folder) => folder?.m_folderID === image.m_folderID
      )
    );

    if (isInLayout) {
      acc[image.m_folderID] = image;
    }

    return acc;
  }, {});
}

export function getLayoutStateForCover(
  layout: Folder,
  images: Image[]
): LayoutState {
  if (!layout)
    return {
      layoutDimensions: { width: 0, height: 0 },
      imagesMap: {},
      pageIds: [],
      layoutElements: [{ layout: null, layoutImage: [] }],
      isNeedToCutBleed: false,
    };
  const [width, height] = layout.m_size.split(',').map(Number);
  const imageTypeFolders = filterFoldersByType(layout, 'IMAGE_TYPE');
  const spineTypeFolders = filterFoldersByType(layout, 'SPINE_REGION_TYPE');
  const textTypeFolders = filterFoldersByType(layout, 'TITLE_TYPE');
  const firstPage = layout.m_child_folders?.[0] ?? null;
  const secondPage = layout.m_child_folders?.[1] ?? null;
  const pageIds = [
    firstPage?.m_folderID ?? 0,
    secondPage?.m_folderID ?? 0,
  ].filter((id) => id !== 0);
  const layoutElementsArray = new Array<{
    layout: Folder | null;
    layoutImage: Folder[];
  }>();
  let isNeedToCutBleed = false;

  /// i push the second page first because the first page is the cover page
  if (secondPage) {
    const secondPageElements = [
      ...(secondPage.m_child_folders?.filter(
        (folder): folder is Folder => folder !== null
      ) ?? []),
    ];

    layoutElementsArray.push(
      createLayoutElement(secondPage, secondPageElements)
    );
  }

  /// check if the heigh of the first image bigger than 3/4 of the first page height for the cover page because we need to cut the bleed
  const { height: heightImage } = parseSizeLayout(imageTypeFolders[0]?.m_size);
  const { height: heightFirstPage } = parseSizeLayout(firstPage?.m_size);
  if (heightImage > (heightFirstPage * 3) / 4) {
    isNeedToCutBleed = true;
  }

  if (firstPage) {
    const firstPageElements = [
      ...imageTypeFolders,
      ...textTypeFolders,
      ...spineTypeFolders,
    ];

    layoutElementsArray.push(createLayoutElement(firstPage, firstPageElements));
  }

  const imagesMap = buildImagesMap(images, layoutElementsArray);
  return {
    layoutDimensions: { width, height },
    imagesMap,
    pageIds,
    layoutElements: layoutElementsArray,
    isNeedToCutBleed,
  };
}

export function calculateSlotPosition({
  x,
  y,
  width,
  height,
  layoutWidth,
  layoutHeight,
}: SlotPositioning): {
  widthPercentage: number;
  heightPercentage: number;
  normalizedLeft: number;
  normalizedTop: number;
  baseStyle: CSSProperties;
} {
  const widthPercentage = (width / layoutWidth) * 100;
  const heightPercentage = (height / layoutHeight) * 100;
  const normalizedLeft = ((x - width / 2) / layoutWidth) * 100;
  const normalizedTop = ((y - height / 2) / layoutHeight) * 100;

  const baseStyle: CSSProperties = {
    width: `${widthPercentage}%`,
    height: `${heightPercentage}%`,
    left: `${normalizedLeft}%`,
    top: `${normalizedTop}%`,
    position: 'absolute',
  };

  return {
    widthPercentage,
    heightPercentage,
    normalizedLeft,
    normalizedTop,
    baseStyle,
  };
}

export function cleanColor(color: string): string {
  return color.replace('#FF', '#');
}

export function getTextById(
  folder: Folder,
  album: PhotoAlbum | null,
  isCover: boolean = false
): string {
  const textId =
    folder.m_type !== 'SPINE_REGION_TYPE'
      ? folder.m_folderID
      : folder?.m_child_folders?.[0]?.m_folderID || 0;

  // For cover, check in cover_subtree
  // For regular pages, check in book_subtree
  const text = isCover
    ? album?.m_treeV5.m_cover_subtree.m_tree_texts.filter(
        (text) => text.m_folderID === textId
      )
    : album?.m_treeV5.m_book_subtree.m_tree_texts.filter(
        (text) => text.m_folderID === textId
      );

  return text?.[0]?.m_text?.m_text_str || '';
}

export function getFontSizeById(
  folder: Folder,
  album: PhotoAlbum | null,
  isCover: boolean = false
): number | undefined {
  const textId =
    folder.m_type !== 'SPINE_REGION_TYPE'
      ? folder.m_folderID
      : folder?.m_child_folders?.[0]?.m_folderID || 0;

  // For cover, check in cover_subtree
  // For regular pages, check in book_subtree
  const text = isCover
    ? album?.m_treeV5.m_cover_subtree.m_tree_texts.filter(
        (text) => text.m_folderID === textId
      )
    : album?.m_treeV5.m_book_subtree.m_tree_texts.filter(
        (text) => text.m_folderID === textId
      );

  return text?.[0]?.m_text?.m_base?.m_font_size_px;
}

export function getTextDirectionById(
  folder: Folder,
  album: PhotoAlbum | null,
  isCover: boolean = false
): string {
  const textId =
    folder.m_type !== 'SPINE_REGION_TYPE'
      ? folder.m_folderID
      : folder?.m_child_folders?.[0]?.m_folderID || 0;

  // For cover, check in cover_subtree
  // For regular pages, check in book_subtree
  const text = isCover
    ? album?.m_treeV5.m_cover_subtree.m_tree_texts.filter(
        (text) => text.m_folderID === textId
      )
    : album?.m_treeV5.m_book_subtree.m_tree_texts.filter(
        (text) => text.m_folderID === textId
      );

  return text?.[0]?.m_text?.m_direction || '';
}

// Calculate image ratio accounting for all orientation cases that swap dimensions
function getImageRatio(image: Image): number {
  // Orientations that swap width/height dimensions (90° and 270° rotations)
  const isDimensionSwapped =
    image.m_orientation === 'ROTATE_90' ||
    image.m_orientation === 'ROTATE_270' ||
    image.m_orientation === 'MIRROR_HORIZONTAL_270' ||
    image.m_orientation === 'MIRROR_HORIZONTAL_90';

  return isDimensionSwapped
    ? image.m_medium_height_px / image.m_medium_width_px
    : image.m_medium_width_px / image.m_medium_height_px;
}

// Generic function to update image crop and orientation
export function updateImageCropAndOrientation(
  image: Image,
  containerWidth: number,
  containerHeight: number
) {
  if (!image) return;

  // Check if image has custom rotation applied (only check m_orientation)
  const hasCustomRotation = image.m_orientation !== 'JPEG_NORMAL';

  // Store existing rotation value if it exists, always reset alignment to 0
  image.m_orientation = hasCustomRotation ? image.m_orientation : 'JPEG_NORMAL';

  const containerRatio = containerWidth / containerHeight;
  const imageRatio = getImageRatio(image);

  let cropX = 0;
  let cropY = 0;
  let cropWidth = 1;
  let cropHeight = 1;

  if (containerRatio > imageRatio) {
    cropHeight = imageRatio / containerRatio;
    cropY = (1 - cropHeight) / 2;
  } else {
    cropWidth = containerRatio / imageRatio;
    cropX = (1 - cropWidth) / 2;
  }
  const cropRect: Rect = {
    X: cropX,
    Y: cropY,
    Width: cropWidth,
    Height: cropHeight,
  };

  image.m_crop_rect = validateAndFixCropRect(
    cropRect,
    'layouts.ts/updateImageCropAndOrientation',
    image
  );

  image.m_alignment = 0;
}

/**
 * Get existing page title text for a given page ID
 * Searches for TEXT_TYPE folders within the page and returns the text content
 */
export function getPageTitleText(
  pageId: number,
  album: PhotoAlbum | null
): string {
  if (!album) return '';

  const spreads = album.m_treeV5.m_book_subtree.m_spread_folders || [];

  const targetPageIdElements = findFolderByPageId(spreads, pageId);
  if (!targetPageIdElements) return '';

  const textFolders = targetPageIdElements.m_child_folders?.filter(
    (folder): folder is Folder =>
      folder !== null && folder.m_type === folderMtypeEnum.TEXT_TYPE
  );

  if (!textFolders || textFolders.length === 0) return '';

  const textFolder = textFolders[0];
  if (!textFolder) return '';
  return getTextById(textFolder, album, false);
}

export function findAndPrepareTargetPage(
  album: PhotoAlbum,
  pageId: number
): Folder | null {
  const targetFolder = findFolderByPageId(
    album.m_treeV5.m_book_subtree.m_spread_folders,
    pageId
  );

  if (!targetFolder) return null;

  const targetPageIdElements = targetFolder;

  if (!targetPageIdElements) {
    return null;
  }

  if (targetPageIdElements.m_child_folders) {
    targetPageIdElements.m_child_folders =
      targetPageIdElements.m_child_folders.filter(
        (folder) => folder && folder.m_type !== folderMtypeEnum.TEXT_TYPE
      );
  }

  return targetPageIdElements;
}

export function calculateXPosition(
  x: number,
  layoutWidth: number,
  isLTR: string,
  isCover: boolean
): number {
  const FRAME_WIDTH = 100;
  return isLTR === 'LTR' && isCover ? x - layoutWidth - FRAME_WIDTH : x;
}

export function calculateMinCropDimensions({
  originalWidth,
  mediumWidth,
  mediumHeight,
  targetWidth,
  targetHeight,
  minRes,
  treeRes,
}: CropDimensionParams): CropDimensions {
  const targetAspectRatio = targetWidth / targetHeight;

  // Step 1: Calculate minimum crop dimensions in original pixels
  const minCropInOriginalPixels = {
    width: (targetWidth * minRes) / treeRes,
    height: (targetHeight * minRes) / treeRes,
  };

  // Step 2: Convert to medium image coordinates
  const mediumToOriginalRatio = mediumWidth / originalWidth;
  const minCropInMediumPixels = {
    width: Math.ceil(minCropInOriginalPixels.width * mediumToOriginalRatio),
    height: Math.ceil(minCropInOriginalPixels.height * mediumToOriginalRatio),
  };

  // Step 3: Ensure we maintain the target aspect ratio
  const finalDimensions = {
    width: minCropInMediumPixels.width,
    height: minCropInMediumPixels.height,
  };

  // Adjust to maintain aspect ratio - use the dimension that requires the larger crop area
  const aspectRatioAdjustments = {
    requiredHeightForWidth: finalDimensions.width / targetAspectRatio,
    requiredWidthForHeight: finalDimensions.height * targetAspectRatio,
  };

  if (aspectRatioAdjustments.requiredHeightForWidth > finalDimensions.height) {
    // Width-based calculation requires more area
    finalDimensions.height = Math.ceil(
      aspectRatioAdjustments.requiredHeightForWidth
    );
  } else {
    // Height-based calculation requires more area
    finalDimensions.width = Math.ceil(
      aspectRatioAdjustments.requiredWidthForHeight
    );
  }

  // Step 4: Ensure we don't exceed medium image bounds
  finalDimensions.width = Math.min(finalDimensions.width, mediumWidth);
  finalDimensions.height = Math.min(finalDimensions.height, mediumHeight);

  // Step 5: Final adjustment based on target and image aspect ratio
  // A smaller number means more vertical image shape.
  const imageAspectRatio = mediumWidth / mediumHeight;
  // Checking if the image's shape taller/skinnier/more vertical than the target's/container shape.
  const isImageTallerThanTarget = imageAspectRatio < targetAspectRatio;

  if (isImageTallerThanTarget) {
    // This block runs if the image is TALLER than the target shape.
    // Therefore, we use the width and normalize the height with aspect ratio.
    if (finalDimensions.width < minCropInMediumPixels.width) {
      finalDimensions.width = Math.min(
        minCropInMediumPixels.width,
        mediumWidth
      );
      finalDimensions.height = Math.min(
        Math.ceil(finalDimensions.width / targetAspectRatio),
        mediumHeight
      );
    }
  } else {
    // This block runs if the image is WIDER than the target shape.
    // Therefore, we use the height and normalize the width with aspect ratio.
    if (finalDimensions.height < minCropInMediumPixels.height) {
      finalDimensions.height = Math.min(
        minCropInMediumPixels.height,
        mediumHeight
      );
      finalDimensions.width = Math.min(
        Math.ceil(finalDimensions.height * targetAspectRatio),
        mediumWidth
      );
    }
  }

  return {
    width: Math.max(1, finalDimensions.width),
    height: Math.max(1, finalDimensions.height),
  };
}

export function createImageState(
  cropData: { x: number; y: number; width: number; height: number },
  jpeg_orientation: string,
  isCover: boolean,
  alignment: number
): PinturaImageState | null {
  // FOR NOW BECAUSE OF BUGS WE ARE NOT IMPLEMENTING CROP FOR COVER PAGES -- ITS POSSIBLE TO DO IT LATER
  if (isCover || !cropData || !jpeg_orientation) {
    return null;
  }
  // Extra safe check: Validate crop data to ensure width and height are not zero or null - pintura black editor issue
  const isCropWidthHeightInvalid =
    cropData.width === 0 ||
    cropData.height === 0 ||
    cropData.width === null ||
    cropData.height === null;
  if (isCropWidthHeightInvalid) {
    console.error(
      'Invalid crop data, width or height is 0 or null: in createImageState',
      cropData
    );
    cropData = {
      x: cropData.x,
      y: cropData.y,
      width: isCropWidthHeightInvalid ? 1 : cropData.width,
      height: isCropWidthHeightInvalid ? 1 : cropData.height,
    };
  }

  const rotationObj = getRadiansFromOrientation(jpeg_orientation, alignment);
  return {
    crop: cropData,
    flipX: rotationObj.flipX,
    flipY: rotationObj.flipY,
    rotation: rotationObj.rotationRad,
  };
}
