# lib/dnd — React Native DnD Kit

## What This Is

A self-contained drag-and-drop library for React Native with an API modeled after `@dnd-kit/core` and `@dnd-kit/sortable`. Built on `react-native-reanimated` + `react-native-gesture-handler`.

## File Structure

```
lib/dnd/
├── types.ts              # All exported TypeScript types
├── collision.ts          # pointerWithin and closestCenter algorithms
├── context.tsx           # DndProvider component + useDndContext hook
├── use-draggable.ts      # useDraggable hook
├── use-droppable.ts      # useDroppable hook
├── drag-overlay.tsx      # DragOverlay component (optional floating preview)
├── sortable-context.tsx  # SortableContext + useSortableContext
├── use-sortable.ts       # useSortable hook (draggable + droppable combined)
└── index.ts              # Public re-exports
```

## Key Patterns

### Threading Model
- **UI thread**: Shared values (`translateX`, `translateY`) for 60fps animation
- **JS thread**: React state (`activeId`, `overId`) for rendering, collision detection via `runOnJS`
- Gesture callbacks run on UI thread, dispatch to JS thread via `runOnJS`

### Gesture Configuration
- `useDraggable` without `activationDelay`: immediate pan with `minDistance(5)`
- `useDraggable` with `activationDelay`: long-press activation via `activateAfterLongPress()`
- `useSortable` defaults to `activationDelay: 200` (long-press to distinguish from scroll)

### Droppable Registry
- `DndProvider` maintains a `Map<id, DroppableEntry>` of registered droppables
- Droppables register on mount, unregister on unmount
- Bounds measured via `measureInWindow` (absolute screen coordinates)
- Collision detection runs against registered droppables on each drag update

### Sortable Reorder Flow
- `SortableContext` tracks a virtual order during drag (separate from React state)
- Other items animate to shifted positions via spring-animated shared value offsets
- On drag end, `onReorder` fires with the new order, then virtual order resets
- Critical: the drag-end effect must read `virtualOrderRef` before any sync effect resets it

### DragOverlay (optional)
- Positioned absolutely within DndProvider, follows drag via shared values
- For mobile, direct-drag (item follows finger) is simpler — `DragOverlay` exists for cases where the original must stay in place while a clone follows

## Conventions

- Follow the project's CLAUDE.md: no `React.memo`/`useMemo`/`useCallback` (React Compiler handles it)
- Kebab-case file names
- All types exported from `types.ts`
- No external dependencies beyond reanimated + gesture handler

## Common Pitfalls

- **Overflow clipping**: If `DndProvider` has `borderRadius`, the overlay gets clipped on Android. Use `overflow: 'visible'` on the provider and keep `borderRadius` on an inner wrapper.
- **Stale droppable bounds**: Bounds are measured on layout. If the container scrolls or resizes, bounds become stale. Re-measure by triggering `onLayout`.
- **Sortable effect ordering**: When `activeId` goes null, multiple effects fire. The drag-end detection effect must run before any effect that resets the virtual order.
- **`elevation` on Android**: Use both `zIndex` and `elevation` for proper stacking on Android.
