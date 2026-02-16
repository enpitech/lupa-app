import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import type { LayoutChangeEvent, View } from 'react-native';
import { useRef } from 'react';
import { useDndContext } from './context';
import { useSortableContext } from './sortable-context';
import type { SortableOptions, SortableContextValue } from './types';

export function useSortable({
  id,
  data = {},
  disabled = false,
  activationDelay = 200,
}: SortableOptions) {
  const dndCtx = useDndContext();
  const sortableCtx = useSortableContext() as SortableContextValue & {
    _registerOffset: (
      id: string,
      sv: ReturnType<typeof useSharedValue<number>>,
    ) => void;
  };

  const viewRef = useRef<View>(null);

  // Create and register shared value offset for this item
  const offset = useSharedValue(0);
  useEffect(() => {
    sortableCtx._registerOffset(id, offset);
  }, [id]);

  // Register as droppable
  useEffect(() => {
    dndCtx.registerDroppable({
      id,
      bounds: { x: 0, y: 0, width: 0, height: 0 },
      data,
      disabled,
    });
    return () => {
      dndCtx.unregisterDroppable(id);
    };
  }, [id]);

  function onLayout(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;
    sortableCtx.registerHeight(id, height);

    viewRef.current?.measureInWindow((x, y, w, h) => {
      dndCtx.updateDroppableBounds(id, { x, y, width: w, height: h });
    });
  }

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .activateAfterLongPress(activationDelay)
    .onStart((event) => {
      runOnJS(dndCtx.startDrag)(
        id,
        data,
        event.absoluteX,
        event.absoluteY,
        event.x,
        event.y,
      );
    })
    .onUpdate((event) => {
      runOnJS(dndCtx.updateDrag)(event.translationX, event.translationY);
    })
    .onEnd(() => {
      runOnJS(dndCtx.endDrag)();
    })
    .onFinalize((_event, success) => {
      if (!success) {
        runOnJS(dndCtx.cancelDrag)();
      }
    });

  const isDraggingThis = dndCtx.activeId === id;
  const isOver = dndCtx.overId === id;

  // Read the offset from sortable context
  const sortableOffset = (() => {
    try {
      return sortableCtx.getOffset(id);
    } catch {
      return offset;
    }
  })();

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = dndCtx.activeId === id;
    return {
      transform: [
        { translateX: isActive ? dndCtx.translateX.value : 0 },
        {
          translateY: isActive
            ? dndCtx.translateY.value
            : withSpring(sortableOffset.value, {
                damping: 20,
                stiffness: 200,
              }),
        },
      ],
      opacity: isActive ? 0.5 : 1,
      zIndex: isActive ? 999 : 0,
    };
  });

  return {
    gesture,
    animatedStyle,
    isDragging: isDraggingThis,
    isOver,
    ref: viewRef,
    onLayout,
  };
}
