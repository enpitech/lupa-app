import { getRandomLayout, processLayouts } from '@/lib/TreeV5/utils/layouts';
import { Layout, Frame, TreeV5Resources } from '@/types/tree';
import {
  LayoutFamilyType,
  detectLayoutFamily,
} from '@/lib/TreeV5/utils/layouts';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { trackError } from '@/utils/datadogErrorTracking';

export interface LayoutTreeStore {
  groupByCountSpread: Record<number, Layout[]>;
  keyValueLayoutsSpread: Record<number, Layout>;
  maxCountSpread: number;
  groupByCountLayflat: Record<number, Layout[]>;
  keyValueLayoutsLayflat: Record<number, Layout>;
  maxCountLayflat: number;
  albumResources: TreeV5Resources;
  framesResources: Frame[];
  flushCache: string;
  setLayouts: (layoutsSpread: Layout[], layoutsLayflat: Layout[]) => void;
  setFramesResources: (framesResources: Frame[]) => void;
  clearFramesResources: () => void;
  getFramesResources: () => Frame[];
  getFrameByName: (frameName: string) => Frame | undefined;
  getFrameById: (uniqueId: number) => Frame | undefined;
  getAlbumImageFrameColor: () => string;
  getSpeardLayoutById: (id: number) => Layout;
  getLayflatLayoutById: (id: number) => Layout;
  setAlbumResources: (resources: TreeV5Resources) => void;
  getRandomFromGroupBySpreadCount: (
    count: number,
    currentLayoutId?: number
  ) => Layout;
  getRandomFromGroupByLayflatCount: (
    count: number,
    currentLayoutId?: number
  ) => Layout;
  getLayoutFamily: (layoutId: number) => LayoutFamilyType | null;
  invalidateCache: () => void;
}

const useLayoutTreeStore = create<LayoutTreeStore>()(
  persist(
    (set, get) => ({
      groupByCountSpread: {},
      keyValueLayoutsSpread: {},
      maxCountSpread: 0,
      groupByCountLayflat: {},
      keyValueLayoutsLayflat: {},
      maxCountLayflat: 0,
      framesResources: [],
      albumResources: {} as TreeV5Resources,
      flushCache: Date.now().toString(),

      setLayouts: (layoutsSpread: Layout[], layoutsLayflat: Layout[]) => {
        try {
          const {
            groupByCount: groupByCountSpread,
            keyValueLayouts: keyValueLayoutsSpread,
            maxCount: maxCountSpread,
          } = processLayouts(layoutsSpread);

          const {
            groupByCount: groupByCountLayflat,
            keyValueLayouts: keyValueLayoutsLayflat,
            maxCount: maxCountLayflat,
          } = processLayouts(layoutsLayflat);

          set({
            groupByCountSpread,
            keyValueLayoutsSpread,
            maxCountSpread,
            groupByCountLayflat,
            keyValueLayoutsLayflat,
            maxCountLayflat,
          });
        } catch (error) {
          trackError(error as Error, {
            errorType: 'store_error',
            store: 'layout',
            action: 'setLayouts',
            spreadLayoutsCount: layoutsSpread.length,
            layflatLayoutsCount: layoutsLayflat.length,
          });
        }
      },

      setFramesResources: (framesResources: Frame[]) => {
        set({ framesResources });
      },
      setAlbumResources: (resources: TreeV5Resources) => {
        set({ albumResources: resources });
      },
      getAlbumResources: () => {
        return get().albumResources;
      },

      clearFramesResources: () => {
        set({ framesResources: [] });
      },

      getFramesResources: () => {
        return get().framesResources;
      },

      getFrameByName: (frameName: string) => {
        const framesResources = get().framesResources;
        return framesResources.find(
          (frame: Frame) => frame.m_frame_name === frameName
        );
      },

      getFrameById: (uniqueId: number) => {
        const framesResources = get().framesResources;
        return framesResources.find(
          (frame: Frame) => frame.m_unique_id === uniqueId
        );
      },

      getAlbumImageFrameColor: () => {
        const framesResources = get().framesResources;
        const resourceFrame = framesResources.filter(
          (frame: Frame) =>
            frame?.m_frame_name &&
            (frame.m_frame_name.indexOf('inner') >= 0 ||
              frame.m_frame_name.indexOf('B') >= 0)
        );

        const imageFrameColor =
          resourceFrame?.[0]?.m_font_bg_image_or_color ?? 'unset';
        if (imageFrameColor === 'unset') {
          console.error('unset frame color Error');
        }
        return imageFrameColor;
      },

      getSpeardLayoutById: (id: number) => {
        return get().keyValueLayoutsSpread[id];
      },

      getLayflatLayoutById: (id: number) => {
        return get().keyValueLayoutsLayflat[id];
      },

      getRandomFromGroupBySpreadCount: (
        count: number,
        currentLayoutId?: number
      ) => {
        const layouts = get().groupByCountSpread[count] || [];
        const filteredLayouts = currentLayoutId
          ? layouts.filter((layout) => layout.m_ID !== currentLayoutId)
          : layouts;

        return getRandomLayout(count, { [count]: filteredLayouts });
      },

      getRandomFromGroupByLayflatCount: (
        count: number,
        currentLayoutId?: number
      ) => {
        const layouts = get().groupByCountLayflat[count] || [];
        const filteredLayouts = currentLayoutId
          ? layouts.filter((layout) => layout.m_ID !== currentLayoutId)
          : layouts;

        return getRandomLayout(count, { [count]: filteredLayouts });
      },

      getLayoutFamily: (layoutId: number) => {
        const layouts = [
          ...Object.values(get().keyValueLayoutsSpread),
          ...Object.values(get().keyValueLayoutsLayflat),
        ];
        const layout = layouts.find((l) => l.m_ID === layoutId);
        return layout ? detectLayoutFamily(layout) : null;
      },

      invalidateCache: () => {
        set({ flushCache: Date.now().toString() });
      },
    }),
    {
      name: 'layout-tree-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useLayoutTreeStore;
