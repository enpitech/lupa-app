import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { useDndContext } from './context';
import type { DragOverlayProps } from './types';

export function DragOverlay({ children }: DragOverlayProps) {
  const ctx = useDndContext();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ctx.overlayX.value + ctx.translateX.value },
      { translateY: ctx.overlayY.value + ctx.translateY.value },
    ],
    opacity: ctx.isDragging.value ? 1 : 0,
  }));

  if (!ctx.activeId) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.overlay, animatedStyle]}
      pointerEvents="none"
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    elevation: 999,
  },
});
