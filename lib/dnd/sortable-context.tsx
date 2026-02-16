import { createContext, useContext, useEffect, useRef } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useDndContext } from './context';
import type { SortableContextProps, SortableContextValue } from './types';

const SortableCtx = createContext<SortableContextValue | null>(null);

export function useSortableContext(): SortableContextValue {
  const ctx = useContext(SortableCtx);
  if (!ctx) {
    throw new Error('useSortableContext must be used within a SortableContext');
  }
  return ctx;
}

export function SortableContext({
  children,
  items,
  onReorder,
}: SortableContextProps) {
  const dndCtx = useDndContext();
  const { activeId, overId } = dndCtx;

  // Store item heights for offset calculation
  const heightsRef = useRef(new Map<string, number>());

  // Shared value offsets per item (using a map of shared values)
  const offsetsRef = useRef(new Map<string, SharedValue<number>>());

  // Track the virtual order during a drag
  const virtualOrderRef = useRef<string[]>(items);

  // Keep virtual order synced with items ONLY when items change externally
  // (not when activeId changes — that would reset during drag-end)
  useEffect(() => {
    if (!activeId) {
      virtualOrderRef.current = [...items];
    }
  }, [items]);

  function registerHeight(id: string, height: number) {
    heightsRef.current.set(id, height);
  }

  function getOffset(id: string): SharedValue<number> {
    const offset = offsetsRef.current.get(id);
    if (!offset) {
      throw new Error(
        `No offset found for item ${id}. Make sure useSortable is called for this item.`,
      );
    }
    return offset;
  }

  // Register an offset shared value (called by useSortable)
  function _registerOffset(id: string, sv: SharedValue<number>) {
    offsetsRef.current.set(id, sv);
  }

  // Compute offsets when overId changes during a drag
  useEffect(() => {
    if (!activeId || !overId || activeId === overId) {
      // Reset all offsets when not in a valid drag-over state
      for (const [, sv] of offsetsRef.current) {
        sv.value = 0;
      }
      return;
    }

    const currentOrder = [...items];
    const activeIndex = currentOrder.indexOf(activeId);
    const overIndex = currentOrder.indexOf(overId);

    if (activeIndex === -1 || overIndex === -1) return;

    const activeHeight = heightsRef.current.get(activeId) ?? 0;

    // Items between active and over need to shift
    const start = Math.min(activeIndex, overIndex);
    const end = Math.max(activeIndex, overIndex);
    const direction = activeIndex < overIndex ? -1 : 1;

    for (const [itemId, sv] of offsetsRef.current) {
      const itemIndex = currentOrder.indexOf(itemId);
      if (itemId === activeId) {
        sv.value = 0;
      } else if (itemIndex >= start && itemIndex <= end) {
        sv.value = direction * activeHeight;
      } else {
        sv.value = 0;
      }
    }

    // Update virtual order
    const newOrder = [...currentOrder];
    newOrder.splice(activeIndex, 1);
    newOrder.splice(overIndex, 0, activeId);
    virtualOrderRef.current = newOrder;
  }, [activeId, overId, items]);

  // On drag end, fire onReorder if order changed
  const prevActiveId = useRef<string | null>(null);
  useEffect(() => {
    if (prevActiveId.current && !activeId) {
      // Drag just ended — read the virtual order BEFORE it gets reset
      const newOrder = virtualOrderRef.current;
      const orderChanged = items.some((id, i) => id !== newOrder[i]);
      if (orderChanged) {
        onReorder(newOrder);
      }
      // Reset offsets
      for (const [, sv] of offsetsRef.current) {
        sv.value = 0;
      }
      // Now safe to reset virtual order
      virtualOrderRef.current = [...items];
    }
    prevActiveId.current = activeId;
  }, [activeId]);

  const contextValue: SortableContextValue & {
    _registerOffset: (id: string, sv: SharedValue<number>) => void;
  } = {
    activeId,
    items,
    getOffset,
    registerHeight,
    _registerOffset,
  };

  return (
    <SortableCtx.Provider value={contextValue}>{children}</SortableCtx.Provider>
  );
}
