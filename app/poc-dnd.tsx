import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DndProvider,
  SortableContext,
  useDraggable,
  useDroppable,
  useSortable,
} from '@/lib/dnd';
import type { DragEndEvent } from '@/lib/dnd';

// =============================================================================
// Section 1: Drag Between Zones
// =============================================================================

const DRAG_ITEMS = [
  { id: 'color-1', label: 'Red', color: '#EF4444' },
  { id: 'color-2', label: 'Blue', color: '#3B82F6' },
  { id: 'color-3', label: 'Green', color: '#22C55E' },
];

function DraggableItem({
  id,
  label,
  color,
}: {
  id: string;
  label: string;
  color: string;
}) {
  const { gesture, animatedStyle, isDragging } = useDraggable({
    id,
    data: { label, color },
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.draggableItem,
          { backgroundColor: color },
          animatedStyle,
        ]}
      >
        <Text style={styles.draggableText}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function DropZone({
  id,
  label,
  items,
}: {
  id: string;
  label: string;
  items: { id: string; label: string; color: string }[];
}) {
  const { ref, onLayout, isOver } = useDroppable({
    id,
    data: { accepts: 'color' },
  });

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={[
        styles.dropZone,
        isOver && styles.dropZoneActive,
      ]}
    >
      <Text style={styles.dropZoneLabel}>{label}</Text>
      <View style={styles.dropZoneItems}>
        {items.map((item) => (
          <View
            key={item.id}
            style={[styles.droppedItem, { backgroundColor: item.color }]}
          >
            <Text style={styles.draggableText}>{item.label}</Text>
          </View>
        ))}
        {items.length === 0 && (
          <Text style={styles.placeholderText}>Drop items here</Text>
        )}
      </View>
    </View>
  );
}

function DragBetweenZonesDemo() {
  const [sourceItems, setSourceItems] = useState(DRAG_ITEMS);
  const [zoneItems, setZoneItems] = useState<
    { id: string; label: string; color: string }[]
  >([]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    if (over.id === 'drop-zone') {
      const item = sourceItems.find((i) => i.id === active.id);
      if (item) {
        setSourceItems((prev) => prev.filter((i) => i.id !== active.id));
        setZoneItems((prev) => [...prev, item]);
      }
    }
  }

  return (
    <DndProvider
      onDragEnd={handleDragEnd}
      collisionDetection="pointerWithin"
      style={styles.demoSection}
    >
      <View style={styles.demoCard}>
        <Text style={styles.sectionTitle}>1. Drag Between Zones</Text>
        <Text style={styles.sectionDesc}>Drag colored items to the drop zone</Text>

        <View style={styles.sourceRow}>
          {sourceItems.map((item) => (
            <DraggableItem
              key={item.id}
              id={item.id}
              label={item.label}
              color={item.color}
            />
          ))}
          {sourceItems.length === 0 && (
            <Text style={styles.placeholderText}>All items moved!</Text>
          )}
        </View>

        <DropZone id="drop-zone" label="Drop Zone" items={zoneItems} />
      </View>
    </DndProvider>
  );
}

// =============================================================================
// Section 2: Sortable List
// =============================================================================

const INITIAL_LIST = [
  { id: 'task-1', text: 'Buy groceries' },
  { id: 'task-2', text: 'Walk the dog' },
  { id: 'task-3', text: 'Read a book' },
  { id: 'task-4', text: 'Write code' },
  { id: 'task-5', text: 'Cook dinner' },
];

function SortableItem({ id, text }: { id: string; text: string }) {
  const { gesture, animatedStyle, isDragging, ref, onLayout } = useSortable({
    id,
    activationDelay: 200,
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        ref={ref}
        onLayout={onLayout}
        style={[
          styles.sortableItem,
          isDragging && styles.sortableItemDragging,
          animatedStyle,
        ]}
      >
        <Text style={styles.sortableGrip}>:::</Text>
        <Text style={styles.sortableText}>{text}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function SortableListDemo() {
  const [items, setItems] = useState(INITIAL_LIST);

  return (
    <DndProvider
      collisionDetection="closestCenter"
      style={styles.demoSection}
    >
      <View style={styles.demoCard}>
        <Text style={styles.sectionTitle}>2. Sortable List</Text>
        <Text style={styles.sectionDesc}>Long-press and drag to reorder</Text>

        <SortableContext
          items={items.map((i) => i.id)}
          onReorder={(newIds) => {
            const reordered = newIds.map(
              (id) => items.find((i) => i.id === id)!,
            );
            setItems(reordered);
          }}
        >
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} text={item.text} />
          ))}
        </SortableContext>
      </View>
    </DndProvider>
  );
}

// =============================================================================
// Section 3: Photo Grid Swap
// =============================================================================

const PHOTO_COLORS = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA'];
const INITIAL_PHOTOS = PHOTO_COLORS.map((color, i) => ({
  id: `photo-${i + 1}`,
  color,
  label: `${i + 1}`,
}));

function PhotoCard({ id, color, label }: { id: string; color: string; label: string }) {
  const { gesture, animatedStyle, isDragging } = useDraggable({
    id,
    data: { color, label },
    activationDelay: 150,
  });
  const { ref, onLayout, isOver } = useDroppable({ id });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        ref={ref}
        onLayout={onLayout}
        style={[
          styles.photoCard,
          { backgroundColor: color },
          isOver && styles.photoCardOver,
          animatedStyle,
        ]}
      >
        <Text style={styles.photoLabel}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

function PhotoGridDemo() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setPhotos((prev) => {
      const newPhotos = [...prev];
      const activeIndex = newPhotos.findIndex((p) => p.id === active.id);
      const overIndex = newPhotos.findIndex((p) => p.id === over.id);
      if (activeIndex === -1 || overIndex === -1) return prev;

      // Swap
      [newPhotos[activeIndex], newPhotos[overIndex]] = [
        newPhotos[overIndex],
        newPhotos[activeIndex],
      ];
      return newPhotos;
    });
  }

  return (
    <DndProvider
      onDragEnd={handleDragEnd}
      collisionDetection="closestCenter"
      style={styles.demoSection}
    >
      <View style={styles.demoCard}>
        <Text style={styles.sectionTitle}>3. Photo Grid Swap</Text>
        <Text style={styles.sectionDesc}>Drag photos to swap positions</Text>

        <View style={styles.photoGrid}>
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              color={photo.color}
              label={photo.label}
            />
          ))}
        </View>
      </View>
    </DndProvider>
  );
}

// =============================================================================
// Main Screen
// =============================================================================

export default function PocDndScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>DnD Kit POC</Text>
        <DragBetweenZonesDemo />
        <SortableListDemo />
        <PhotoGridDemo />
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 64,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  // DndProvider wrapper — no borderRadius so overlay isn't clipped
  demoSection: {
    marginBottom: 32,
  },
  // Inner card with visual styling
  demoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  // --- Section 1: Drag Between Zones ---
  sourceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  draggableItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dropZone: {
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dropZoneActive: {
    borderColor: '#22C55E',
    backgroundColor: '#f0fdf4',
  },
  dropZoneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  dropZoneItems: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  droppedItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#d1d5db',
    fontSize: 14,
    fontStyle: 'italic',
  },
  // --- Section 2: Sortable List ---
  sortableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  sortableItemDragging: {
    borderColor: '#3B82F6',
    backgroundColor: '#eff6ff',
  },
  sortableGrip: {
    fontSize: 18,
    color: '#9ca3af',
    marginRight: 12,
    letterSpacing: 2,
  },
  sortableText: {
    fontSize: 16,
    color: '#374151',
  },
  // --- Section 3: Photo Grid ---
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCardOver: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
  },
  photoLabel: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
