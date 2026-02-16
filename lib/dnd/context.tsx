import { createContext, useContext, useRef, useState } from 'react';
import { View } from 'react-native';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { pointerWithin, closestCenter } from './collision';
import type {
  DndContextValue,
  DndProviderProps,
  DroppableBounds,
  DroppableEntry,
} from './types';

const DndContext = createContext<DndContextValue | null>(null);

export function useDndContext(): DndContextValue {
  const ctx = useContext(DndContext);
  if (!ctx) {
    throw new Error('useDndContext must be used within a DndProvider');
  }
  return ctx;
}

export function DndProvider({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  collisionDetection = 'pointerWithin',
  style,
  ...viewProps
}: DndProviderProps) {
  // --- React state (JS thread) ---
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // --- Refs ---
  const activeData = useRef<Record<string, unknown>>({});
  const providerOffset = useRef({ x: 0, y: 0 });
  const droppableRegistry = useRef(new Map<string, DroppableEntry>());
  const providerRef = useRef<View>(null);
  const dragStartAbsolute = useRef({ x: 0, y: 0 });

  // --- Shared values (UI thread) ---
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const overlayX = useSharedValue(0);
  const overlayY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  // --- Registry methods ---
  function registerDroppable(entry: DroppableEntry) {
    droppableRegistry.current.set(entry.id, entry);
  }

  function unregisterDroppable(id: string) {
    droppableRegistry.current.delete(id);
  }

  function updateDroppableBounds(id: string, bounds: DroppableBounds) {
    const entry = droppableRegistry.current.get(id);
    if (entry) {
      entry.bounds = bounds;
    }
  }

  // --- Collision detection (JS thread) ---
  function runCollision(absoluteX: number, absoluteY: number) {
    const point = { x: absoluteX, y: absoluteY };
    const detect =
      collisionDetection === 'closestCenter' ? closestCenter : pointerWithin;
    const hit = detect(point, droppableRegistry.current);
    const newOverId = hit?.id ?? null;

    setOverId((prev) => {
      if (prev !== newOverId) {
        onDragOver?.({
          active: { id: activeIdRef.current!, data: activeData.current },
          over: hit ? { id: hit.id, data: hit.data } : null,
        });
      }
      return newOverId;
    });
  }

  // Keep a ref to activeId for use in callbacks that capture stale closure
  const activeIdRef = useRef<string | null>(null);
  const overIdRef = useRef<string | null>(null);

  // Sync refs
  activeIdRef.current = activeId;
  overIdRef.current = overId;

  // --- Drag lifecycle ---
  function startDrag(
    id: string,
    data: Record<string, unknown>,
    absoluteX: number,
    absoluteY: number,
    elementX: number,
    elementY: number,
  ) {
    activeData.current = data;
    dragStartAbsolute.current = { x: absoluteX, y: absoluteY };

    // Element's screen position = absoluteX - elementX (touch within element)
    const elementScreenX = absoluteX - elementX;
    const elementScreenY = absoluteY - elementY;

    // Overlay position relative to provider
    overlayX.value = elementScreenX - providerOffset.current.x;
    overlayY.value = elementScreenY - providerOffset.current.y;

    translateX.value = 0;
    translateY.value = 0;
    isDragging.value = true;

    setActiveId(id);
    setOverId(null);
    onDragStart?.({ active: { id, data } });
  }

  function updateDrag(translationX: number, translationY: number) {
    translateX.value = translationX;
    translateY.value = translationY;

    // Update overlay position
    const startAbs = dragStartAbsolute.current;
    const currentAbsX = startAbs.x + translationX;
    const currentAbsY = startAbs.y + translationY;

    // Run collision detection on JS thread
    runCollision(currentAbsX, currentAbsY);
  }

  function endDrag() {
    const currentActiveId = activeIdRef.current;
    const currentOverId = overIdRef.current;

    if (currentActiveId) {
      const overEntry = currentOverId
        ? droppableRegistry.current.get(currentOverId)
        : null;
      onDragEnd?.({
        active: { id: currentActiveId, data: activeData.current },
        over: overEntry
          ? { id: overEntry.id, data: overEntry.data }
          : null,
      });
    }

    // Reset
    translateX.value = 0;
    translateY.value = 0;
    overlayX.value = 0;
    overlayY.value = 0;
    isDragging.value = false;
    activeData.current = {};

    setActiveId(null);
    setOverId(null);
  }

  function cancelDrag() {
    onDragCancel?.();

    translateX.value = 0;
    translateY.value = 0;
    overlayX.value = 0;
    overlayY.value = 0;
    isDragging.value = false;
    activeData.current = {};

    setActiveId(null);
    setOverId(null);
  }

  const contextValue: DndContextValue = {
    activeId,
    overId,
    activeData,
    translateX,
    translateY,
    overlayX,
    overlayY,
    isDragging,
    registerDroppable,
    unregisterDroppable,
    updateDroppableBounds,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
    providerOffset,
  };

  return (
    <DndContext.Provider value={contextValue}>
      <View
        ref={providerRef}
        style={[{ overflow: 'visible' }, style]}
        collapsable={false}
        onLayout={() => {
          providerRef.current?.measureInWindow((x, y) => {
            providerOffset.current = { x, y };
          });
        }}
        {...viewProps}
      >
        {children}
      </View>
    </DndContext.Provider>
  );
}
