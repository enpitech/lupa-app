import type { RefObject } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { ViewProps } from 'react-native';

// --- Event Types ---

export type DragStartEvent = {
  active: { id: string; data: Record<string, unknown> };
};

export type DragOverEvent = {
  active: { id: string; data: Record<string, unknown> };
  over: { id: string; data: Record<string, unknown> } | null;
};

export type DragEndEvent = {
  active: { id: string; data: Record<string, unknown> };
  over: { id: string; data: Record<string, unknown> } | null;
};

// --- Collision Detection ---

export type DroppableBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DroppableEntry = {
  id: string;
  bounds: DroppableBounds;
  data: Record<string, unknown>;
  disabled: boolean;
};

export type CollisionDetection = 'pointerWithin' | 'closestCenter';

// --- Hook Options ---

export type DraggableOptions = {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
  activationDelay?: number;
};

export type DroppableOptions = {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
};

export type SortableOptions = {
  id: string;
  data?: Record<string, unknown>;
  disabled?: boolean;
  activationDelay?: number;
};

// --- Context Values ---

export type DndContextValue = {
  // State
  activeId: string | null;
  overId: string | null;
  activeData: RefObject<Record<string, unknown>>;

  // Shared values for animation
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  overlayX: SharedValue<number>;
  overlayY: SharedValue<number>;
  isDragging: SharedValue<boolean>;

  // Droppable registry
  registerDroppable: (entry: DroppableEntry) => void;
  unregisterDroppable: (id: string) => void;
  updateDroppableBounds: (id: string, bounds: DroppableBounds) => void;

  // Drag lifecycle
  startDrag: (
    id: string,
    data: Record<string, unknown>,
    absoluteX: number,
    absoluteY: number,
    elementX: number,
    elementY: number,
  ) => void;
  updateDrag: (translationX: number, translationY: number) => void;
  endDrag: () => void;
  cancelDrag: () => void;

  // Provider bounds (for overlay positioning)
  providerOffset: RefObject<{ x: number; y: number }>;
};

export type SortableContextValue = {
  activeId: string | null;
  items: string[];
  getOffset: (id: string) => SharedValue<number>;
  registerHeight: (id: string, height: number) => void;
};

// --- Component Props ---

export type DndProviderProps = {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: () => void;
  collisionDetection?: CollisionDetection;
  activationDelay?: number;
} & ViewProps;

export type DragOverlayProps = {
  children: React.ReactNode;
};

export type SortableContextProps = {
  children: React.ReactNode;
  items: string[];
  onReorder: (items: string[]) => void;
};
