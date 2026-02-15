import { Folder, Image, PhotoAlbum } from '@/types/tree';
import {
  getLayoutState,
  getLayoutStateForCover,
} from '@/lib/TreeV5/utils/layouts';
import {
  createDropZoneDataPage,
  getDraggablePageData,
} from '@/lib/TreeV5/utils/album';
import { PagesData } from '@/types/editor';
import { useUserStore } from '@/stores/user';
import useAlbumTreeStore from '@/stores/albumTree';
import {
  shouldShowLayoutBackground,
  getBackgroundProps,
  getBackgroundPosition,
  createDropZoneStyle,
  getPageBackground,
  calculatePageDimensions,
} from '@/utils/editor/backgroundUtils';
import { generateEndpaper } from '@/utils/pageUtils';
import { LAYFLAT_TYPE } from '@/utils/appConst';

interface LayoutOptions {
  isCover: boolean;
  isSideBar: boolean;
  isSingleCoverPage?: boolean;
}

interface GetProcessedLayoutParams {
  layout: Folder;
  images: Image[];
  eventToken: string;
  maxPageHeight: number;
  pageWidth: number;
  album: PhotoAlbum | null;
  addTextToImage: (id: number, pageId: number, text: string) => void;
  options: LayoutOptions;
}

export function useLayoutProcessing(
  layout: Folder,
  images: Image[],
  eventToken: string,
  maxPageHeight: number,
  pageWidth: number,
  album: PhotoAlbum | null,
  options: LayoutOptions
) {
  const user = useUserStore((state) => state.user);
  const albumFromStore = useAlbumTreeStore((state) => state.album);
  const addTextToImage = useAlbumTreeStore((state) => state.addTextToImage);

  const { layoutDimensions, imagesMap, layoutElements, pageIds } =
    options.isCover
      ? getLayoutStateForCover(layout, images)
      : getLayoutState(layout, images);

  const elementsData: PagesData[] = layoutElements?.map((layoutElement, i) => {
    const dropZoneData = createDropZoneDataPage(
      layout,
      layoutElement.layout ?? layout
    );
    const draggableData = getDraggablePageData(
      layout,
      layoutElement.layout ?? layout,
      album,
      layoutDimensions,
      addTextToImage,
      eventToken,
      i,
      imagesMap
    );
    // For covers in full spread mode, don't apply individual page backgrounds
    // Let the CoverStyleWrapper handle the entire spread background
    const shouldApplyPageBackground =
      !options.isCover || options.isSingleCoverPage;

    const background = shouldApplyPageBackground
      ? getPageBackground(
          options.isCover ? layout : layoutElement.layout || layout,
          album || albumFromStore,
          user
        )
      : '';

    // Use utility function to calculate page dimensions
    const { width: pageWidthToRender, height: pageHeightToRender } =
      calculatePageDimensions(layoutElement.layout, pageWidth, maxPageHeight);

    const isAlbumDirectionLTR = album?.m_treeV5?.m_album_direction === 'LTR';
    const isCoverRightRegion =
      layoutElement.layout?.m_type === 'COVER_RIGHT_REGION_TYPE';

    const shouldShowBackgroundImage =
      shouldApplyPageBackground &&
      shouldShowLayoutBackground(
        options.isCover,
        options.isSideBar,
        isCoverRightRegion,
        isAlbumDirectionLTR
      );

    const backgroundProps = getBackgroundProps(
      background,
      shouldShowBackgroundImage || false
    );

    const backgroundPosition = getBackgroundPosition(
      options.isCover,
      isCoverRightRegion,
      isAlbumDirectionLTR
    );

    let dropZoneStyle = createDropZoneStyle(
      pageWidthToRender,
      pageHeightToRender,
      backgroundPosition,
      backgroundProps,
      options.isSideBar,
      shouldApplyPageBackground // Don't apply shadow if we're not applying page background
    );

    // Make the page rectangle cast a subtle shadow over the background
    // Apply only when not rendering in sidebar
    if (!options.isSideBar && !options.isCover) {
      dropZoneStyle = {
        ...dropZoneStyle,
        boxShadow: '0 0 4px rgba(0,0,0,0.40)',
      };
    }

    return {
      id: pageIds[i] ?? i,
      draggableData,
      dropZoneData,
      dropZoneStyle,
      layoutElement,
      pageId: pageIds[i] ?? 0,
    };
  });

  const isFirstSpread =
    album?.m_treeV5?.m_book_subtree?.m_spread_folders?.[0]?.m_folderID ===
    layout?.m_folderID;
  const isLastPage =
    album?.m_treeV5?.m_book_subtree?.m_spread_folders?.slice(-1)[0]
      ?.m_folderID === layout?.m_folderID;
  const isLayflatSpread = layout?.m_type === LAYFLAT_TYPE;

  if (elementsData.length === 1) {
    if (isFirstSpread) {
      const endpaper: PagesData = generateEndpaper(
        elementsData[0],
        true,
        isLayflatSpread
      );
      elementsData.unshift(endpaper);
    } else if (isLastPage) {
      const endpaper: PagesData = generateEndpaper(
        elementsData[0],
        false,
        isLayflatSpread
      );
      elementsData.push(endpaper);
    }
  }

  return {
    elementsData,
    imagesMap,
  };
}
export function getProccessedLayout({
  layout,
  images,
  eventToken,
  maxPageHeight,
  pageWidth,
  album,
  addTextToImage,
  options,
}: GetProcessedLayoutParams) {
  const user = useUserStore.getState().user;
  const albumFromStore = useAlbumTreeStore.getState().album;

  const { layoutDimensions, imagesMap, layoutElements, pageIds } =
    options.isCover
      ? getLayoutStateForCover(layout, images)
      : getLayoutState(layout, images);

  const elementsData: PagesData[] = layoutElements?.map((layoutElement, i) => {
    const dropZoneData = createDropZoneDataPage(
      layout,
      layoutElement.layout ?? layout
    );

    const draggableData = getDraggablePageData(
      layout,
      layoutElement.layout ?? layout,
      album,
      layoutDimensions,
      addTextToImage,
      eventToken,
      i,
      imagesMap
    );
    const background = getPageBackground(
      options.isCover ? layout : layoutElement.layout || layout,
      album || albumFromStore,
      user
    );

    // Use utility function to calculate page dimensions
    const { width: pageWidthToRender, height: pageHeightToRender } =
      calculatePageDimensions(layoutElement.layout, pageWidth, maxPageHeight);

    const isAlbumDirectionLTR = album?.m_treeV5?.m_album_direction === 'LTR';
    const isCoverRightRegion =
      layoutElement.layout?.m_type === 'COVER_RIGHT_REGION_TYPE';

    const shouldShowBackgroundImage = shouldShowLayoutBackground(
      options.isCover,
      options.isSideBar,
      isCoverRightRegion,
      isAlbumDirectionLTR
    );

    const backgroundProps = getBackgroundProps(
      background,
      shouldShowBackgroundImage
    );

    const backgroundPosition = getBackgroundPosition(
      options.isCover,
      isCoverRightRegion
    );

    const dropZoneStyle = createDropZoneStyle(
      pageWidthToRender,
      pageHeightToRender,
      backgroundPosition,
      backgroundProps,
      options.isSideBar,
      shouldShowBackgroundImage // Don't apply shadow if we're not showing background
    );

    return {
      id: pageIds[i] ?? i,
      draggableData,
      dropZoneData,
      dropZoneStyle,
      layoutElement,
      pageId: pageIds[i] ?? 0,
    };
  });

  const isFirstSpread =
    album?.m_treeV5?.m_book_subtree?.m_spread_folders?.[0]?.m_folderID ===
    layout?.m_folderID;
  const isLastPage =
    album?.m_treeV5?.m_book_subtree?.m_spread_folders?.slice(-1)[0]
      ?.m_folderID === layout?.m_folderID;
  const isLayflatSpread = layout?.m_type === LAYFLAT_TYPE;

  if (elementsData.length === 1) {
    if (isFirstSpread) {
      const endpaper: PagesData = generateEndpaper(
        elementsData[0],
        true,
        isLayflatSpread
      );
      elementsData.unshift(endpaper);
    } else if (isLastPage) {
      const endpaper: PagesData = generateEndpaper(
        elementsData[0],
        false,
        isLayflatSpread
      );
      elementsData.push(endpaper);
    }
  }

  return {
    elementsData,
    imagesMap,
  };
}
