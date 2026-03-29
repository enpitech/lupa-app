import type { GhostSharedValues } from '@/utils/album-layout';
import type { Image } from '@/types/tree';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ImageContent } from './image-content';

type DraggableImageSlotProps = {
  folderID: number;
  image: Image | undefined;
  eventToken: string;
  /** Percentage-based position within the page */
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  /** Pixel-based position within the spread (for ghost positioning) */
  spreadSlotLeft: number;
  slotTop: number;
  slotWidth: number;
  slotHeight: number;
  /** Ghost animation shared values (owned by SpreadView) */
  ghost: GhostSharedValues;
  isDragSource: boolean;
  onDragStart: (folderID: number) => void;
  onDragEnd: (
    dropCenterX: number,
    dropCenterY: number,
    sourceFolderID: number
  ) => void;
  onDragCancel: () => void;
  onTap?: (folderID: number) => void;
};

export function DraggableImageSlot({
  folderID,
  image,
  eventToken,
  leftPct,
  topPct,
  widthPct,
  heightPct,
  spreadSlotLeft,
  slotTop,
  slotWidth,
  slotHeight,
  ghost,
  isDragSource,
  onDragStart,
  onDragEnd,
  onDragCancel,
  onTap,
}: DraggableImageSlotProps) {
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(300)
    .onStart(() => {
      'worklet';
      ghost.ghostX.value = spreadSlotLeft;
      ghost.ghostY.value = slotTop;
      ghost.ghostWidth.value = slotWidth;
      ghost.ghostHeight.value = slotHeight;
      ghost.ghostScale.value = withSpring(1.05);
      ghost.ghostOpacity.value = 1;
      scheduleOnRN(onDragStart, folderID);
    })
    .onChange((e) => {
      'worklet';
      ghost.ghostX.value = spreadSlotLeft + e.translationX;
      ghost.ghostY.value = slotTop + e.translationY;
    })
    .onEnd((e) => {
      'worklet';
      const dropCenterX = spreadSlotLeft + slotWidth / 2 + e.translationX;
      const dropCenterY = slotTop + slotHeight / 2 + e.translationY;
      scheduleOnRN(onDragEnd, dropCenterX, dropCenterY, folderID);
    })
    .onFinalize(() => {
      'worklet';
      ghost.ghostScale.value = withSpring(0);
      ghost.ghostOpacity.value = withSpring(0);
      scheduleOnRN(onDragCancel);
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    'worklet';
    if (onTap) {
      scheduleOnRN(onTap, folderID);
    }
  });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={{
          position: 'absolute',
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
      >
        <View style={[styles.inner, isDragSource && styles.dragSource]}>
          {image ? (
            <ImageContent image={image} eventToken={eventToken} />
          ) : (
            <View style={styles.empty} />
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    overflow: 'hidden',
  },
  dragSource: {
    opacity: 0.4,
  },
  empty: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});
