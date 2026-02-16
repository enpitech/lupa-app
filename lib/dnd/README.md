# React Native DnD Kit

A self-contained drag-and-drop library for React Native, with an API inspired by [@dnd-kit](https://dndkit.com/). Built on `react-native-reanimated` and `react-native-gesture-handler`.

## Dependencies

- `react-native-reanimated` >= 4.x
- `react-native-gesture-handler` >= 2.x (v2 Gesture API)

The app must wrap its root in `<GestureHandlerRootView>` (already done in `app/_layout.tsx`).

## Quick Start

```tsx
import { DndProvider, useDraggable, useDroppable } from '@/lib/dnd';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

function DraggableBox({ id }: { id: string }) {
  const { gesture, animatedStyle, isDragging } = useDraggable({ id });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.box, animatedStyle]}>
        <Text>Drag me</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function DropTarget({ id }: { id: string }) {
  const { ref, onLayout, isOver } = useDroppable({ id });

  return (
    <View ref={ref} onLayout={onLayout} style={isOver && { borderColor: 'green' }}>
      <Text>Drop here</Text>
    </View>
  );
}

function App() {
  return (
    <DndProvider
      onDragEnd={(event) => {
        if (event.over) {
          console.log(`Dropped ${event.active.id} on ${event.over.id}`);
        }
      }}
    >
      <DraggableBox id="item-1" />
      <DropTarget id="zone-1" />
    </DndProvider>
  );
}
```

## API Reference

### `<DndProvider>`

Root context provider. Manages drag state, droppable registry, and collision detection.

| Prop | Type | Default | Description |
|---|---|---|---|
| `onDragStart` | `(event: DragStartEvent) => void` | - | Fires when a drag begins |
| `onDragOver` | `(event: DragOverEvent) => void` | - | Fires when pointer enters/leaves a droppable |
| `onDragEnd` | `(event: DragEndEvent) => void` | - | Fires when drag ends (with `active` and `over`) |
| `onDragCancel` | `() => void` | - | Fires when drag is cancelled |
| `collisionDetection` | `'pointerWithin' \| 'closestCenter'` | `'pointerWithin'` | Collision algorithm |

Also accepts all `ViewProps` (style, etc.).

### `useDraggable(options)`

Makes an element draggable. The item itself follows the finger during drag.

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Unique identifier |
| `data` | `Record<string, unknown>` | `{}` | Arbitrary data passed to event handlers |
| `disabled` | `boolean` | `false` | Disables drag |
| `activationDelay` | `number` | - | Long-press duration (ms) before drag activates |

**Returns:**

| Property | Type | Description |
|---|---|---|
| `gesture` | `PanGesture` | Pass to `<GestureDetector gesture={gesture}>` |
| `animatedStyle` | `AnimatedStyle` | Apply to `<Animated.View style={animatedStyle}>` |
| `isDragging` | `boolean` | Whether this item is currently being dragged |
| `activeData` | `RefObject` | Ref to the active drag's data |

**Usage:**
```tsx
const { gesture, animatedStyle } = useDraggable({ id: 'item-1', activationDelay: 150 });

<GestureDetector gesture={gesture}>
  <Animated.View style={[myStyles, animatedStyle]}>{children}</Animated.View>
</GestureDetector>
```

### `useDroppable(options)`

Registers an element as a drop target.

**Options:**

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | required | Unique identifier |
| `data` | `Record<string, unknown>` | `{}` | Arbitrary data passed to event handlers |
| `disabled` | `boolean` | `false` | Disables this drop target |

**Returns:**

| Property | Type | Description |
|---|---|---|
| `ref` | `RefObject<View>` | Attach to the drop target View |
| `onLayout` | `(event) => void` | Triggers bounds measurement |
| `isOver` | `boolean` | Whether a dragged item is currently over this target |

**Usage:**
```tsx
const { ref, onLayout, isOver } = useDroppable({ id: 'zone-1' });

<View ref={ref} onLayout={onLayout} style={isOver && { borderColor: 'green' }}>
  {children}
</View>
```

### `<DragOverlay>`

Renders a floating preview that follows the drag position. Use when you want the original item to stay in place while a clone follows the finger.

> Note: For most mobile use cases, letting the original item follow the finger via `useDraggable` is simpler and more reliable. `DragOverlay` is available for advanced cases where you need a separate visual.

```tsx
<DragOverlay>
  {activeId && <Preview id={activeId} />}
</DragOverlay>
```

### `<SortableContext>`

Manages reorderable lists. Wraps sortable items and handles offset animations.

| Prop | Type | Description |
|---|---|---|
| `items` | `string[]` | Ordered array of item IDs |
| `onReorder` | `(items: string[]) => void` | Called with new order when drag ends |

### `useSortable(options)`

Combines draggable + droppable behavior for sortable list items.

**Options:** Same as `useDraggable` (id, data, disabled, activationDelay). Default `activationDelay` is 200ms.

**Returns:**

| Property | Type | Description |
|---|---|---|
| `gesture` | `PanGesture` | Pass to `<GestureDetector>` |
| `animatedStyle` | `AnimatedStyle` | Includes drag transform AND sort offset animation |
| `isDragging` | `boolean` | Whether this item is being dragged |
| `isOver` | `boolean` | Whether another item is being dragged over this one |
| `ref` | `RefObject<View>` | Attach to the item View |
| `onLayout` | `(event) => void` | Triggers bounds + height measurement |

**Usage:**
```tsx
const { gesture, animatedStyle, ref, onLayout } = useSortable({ id: 'task-1' });

<GestureDetector gesture={gesture}>
  <Animated.View ref={ref} onLayout={onLayout} style={[myStyles, animatedStyle]}>
    {children}
  </Animated.View>
</GestureDetector>
```

## Collision Detection

Two algorithms available via DndProvider's `collisionDetection` prop:

- **`pointerWithin`** (default) — Returns the first droppable whose bounding rect contains the pointer. Best for distinct, non-overlapping drop zones.
- **`closestCenter`** — Returns the droppable whose center is nearest to the pointer. Best for grids and sortable lists.

## Architecture

- **Gestures**: `Gesture.Pan()` from RNGH v2
- **Animations**: `useSharedValue` + `useAnimatedStyle` from reanimated for 60fps drag
- **Collision**: Runs on JS thread via `runOnJS` from gesture callbacks
- **State split**: Shared values for animation (UI thread), React state for rendering (JS thread)
- **Measurement**: `measureInWindow` for absolute screen coordinates

## POC Demo

See `app/poc-dnd.tsx` for three working demos:
1. **Drag Between Zones** — drag colored items to a drop zone
2. **Sortable List** — long-press to reorder a task list
3. **Photo Grid Swap** — drag photos to swap grid positions

Navigate to it via the "DnD Kit POC" button on the home screen.
