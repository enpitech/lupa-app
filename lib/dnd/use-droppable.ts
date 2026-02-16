import { useEffect, useRef } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';
import { useDndContext } from './context';
import type { DroppableOptions } from './types';

export function useDroppable({ id, data = {}, disabled = false }: DroppableOptions) {
  const ctx = useDndContext();
  const viewRef = useRef<View>(null);

  useEffect(() => {
    ctx.registerDroppable({
      id,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      data,
      disabled,
    });
    return () => {
      ctx.unregisterDroppable(id);
    };
  }, [id]);

  // Update data/disabled when they change
  useEffect(() => {
    ctx.registerDroppable({
      id,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      data,
      disabled,
    });
  }, [disabled, JSON.stringify(data)]);

  function onLayout(_event: LayoutChangeEvent) {
    // Use measureInWindow for absolute screen coordinates
    viewRef.current?.measureInWindow((x, y, width, height) => {
      ctx.updateDroppableBounds(id, { x, y, width, height });
    });
  }

  const isOver = ctx.overId === id;

  return {
    ref: viewRef,
    onLayout,
    isOver,
  };
}
