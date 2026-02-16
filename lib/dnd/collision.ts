import type { DroppableEntry } from './types';

type Point = { x: number; y: number };

/**
 * Returns the droppable whose bounding rect contains the pointer position.
 * If multiple overlap, returns the first match (insertion order).
 */
export function pointerWithin(
  point: Point,
  droppables: Map<string, DroppableEntry>,
): DroppableEntry | null {
  for (const entry of droppables.values()) {
    if (entry.disabled) continue;
    const { x, y, width, height } = entry.bounds;
    if (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    ) {
      return entry;
    }
  }
  return null;
}

/**
 * Returns the droppable whose center is closest to the pointer position.
 */
export function closestCenter(
  point: Point,
  droppables: Map<string, DroppableEntry>,
): DroppableEntry | null {
  let closest: DroppableEntry | null = null;
  let minDistance = Infinity;

  for (const entry of droppables.values()) {
    if (entry.disabled) continue;
    const { x, y, width, height } = entry.bounds;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const distance = Math.sqrt(
      (point.x - centerX) ** 2 + (point.y - centerY) ** 2,
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = entry;
    }
  }
  return closest;
}
