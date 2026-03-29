import type { Folder } from '@/types/tree';
import type { SharedValue } from 'react-native-reanimated';

// ---------- Types ----------

export type SlotRect = {
  folderID: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SlotPercentages = {
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
};

export type GhostSharedValues = {
  ghostX: SharedValue<number>;
  ghostY: SharedValue<number>;
  ghostWidth: SharedValue<number>;
  ghostHeight: SharedValue<number>;
  ghostScale: SharedValue<number>;
  ghostOpacity: SharedValue<number>;
};

// ---------- Helpers ----------

export function parseSizeString(size: string): {
  width: number;
  height: number;
} {
  const [w, h] = size.split(',').map(Number);
  return { width: w, height: h };
}

/** Convert a slot folder's pivot+size into percentage positions within a page. */
export function computeSlotPercentages(
  slotFolder: Folder,
  pageWidthPx: number,
  pageHeightPx: number
): SlotPercentages {
  const slotSize = parseSizeString(slotFolder.m_size);
  const pivotX = slotFolder.m_pivot.X;
  const pivotY = slotFolder.m_pivot.Y;

  return {
    leftPct: ((pivotX - slotSize.width / 2) / pageWidthPx) * 100,
    topPct: ((pivotY - slotSize.height / 2) / pageHeightPx) * 100,
    widthPct: (slotSize.width / pageWidthPx) * 100,
    heightPct: (slotSize.height / pageHeightPx) * 100,
  };
}

/** Convert a slot folder's pivot+size into a pixel rect, optionally offset by pageOffsetX. */
export function computeSlotPixelRect(
  slotFolder: Folder,
  pageWidthPx: number,
  pageHeightPx: number,
  availableWidth: number,
  scaledHeight: number,
  pageOffsetX = 0
): SlotRect {
  const slotSize = parseSizeString(slotFolder.m_size);
  const pivotX = slotFolder.m_pivot.X;
  const pivotY = slotFolder.m_pivot.Y;

  return {
    folderID: slotFolder.m_folderID,
    left:
      pageOffsetX +
      ((pivotX - slotSize.width / 2) / pageWidthPx) * availableWidth,
    top: ((pivotY - slotSize.height / 2) / pageHeightPx) * scaledHeight,
    width: (slotSize.width / pageWidthPx) * availableWidth,
    height: (slotSize.height / pageHeightPx) * scaledHeight,
  };
}

export function isImageSlot(folder: Folder): boolean {
  return folder.m_type !== 'TEXT_TYPE' && folder.m_type !== 'TITLE_TYPE';
}

/** Find the first SlotRect that contains the given point (excluding a source). */
export function findDropTarget(
  rects: SlotRect[],
  x: number,
  y: number,
  excludeFolderID: number
): SlotRect | undefined {
  return rects.find(
    (rect) =>
      rect.folderID !== excludeFolderID &&
      x >= rect.left &&
      x <= rect.left + rect.width &&
      y >= rect.top &&
      y <= rect.top + rect.height
  );
}
