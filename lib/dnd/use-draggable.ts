import { useAnimatedStyle } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useDndContext } from './context';
import type { DraggableOptions } from './types';

export function useDraggable({ id, data = {}, disabled = false, activationDelay }: DraggableOptions) {
  const ctx = useDndContext();

  const hasDelay = activationDelay != null && activationDelay > 0;

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(hasDelay ? 0 : 5)
    .onStart((event) => {
      runOnJS(ctx.startDrag)(
        id,
        data,
        event.absoluteX,
        event.absoluteY,
        event.x,
        event.y,
      );
    })
    .onUpdate((event) => {
      runOnJS(ctx.updateDrag)(event.translationX, event.translationY);
    })
    .onEnd(() => {
      runOnJS(ctx.endDrag)();
    })
    .onFinalize((_event, success) => {
      if (!success) {
        runOnJS(ctx.cancelDrag)();
      }
    });

  if (hasDelay) {
    gesture.activateAfterLongPress(activationDelay);
  }

  // Original item follows the finger — no need for DragOverlay
  const animatedStyle = useAnimatedStyle(() => {
    const isActive = ctx.activeId === id;
    return {
      transform: [
        { translateX: isActive ? ctx.translateX.value : 0 },
        { translateY: isActive ? ctx.translateY.value : 0 },
        { scale: isActive ? 1.05 : 1 },
      ],
      opacity: isActive ? 0.85 : 1,
      zIndex: isActive ? 999 : 0,
      elevation: isActive ? 999 : 0,
    };
  });

  const isDraggingThis = ctx.activeId === id;

  return {
    gesture,
    animatedStyle,
    isDragging: isDraggingThis,
    activeData: ctx.activeData,
  };
}
