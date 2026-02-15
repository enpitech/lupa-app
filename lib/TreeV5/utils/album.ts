import {
  Folder,
  getSpreadFolders,
  Image,
  Layout,
  PhotoAlbum,
} from '@/types/tree';
import { User } from '@/types/user';
import { DraggableType, DropZoneType } from '@/types/editor';
import useAlbumTreeStore from '@/stores/albumTree';
import useLayoutTreeStore from '@/stores/layout';
import { isLayflatAlbum } from '@/lib/utils/albumUtils';
import { folderMtypeEnum } from '@/utils/appConst';
import { env } from '@/config/env';

export const findFolderByPageId = (folders: Folder[], layoutId: number) => {
  for (const folder of folders) {
    const firstChild = folder.m_child_folders?.[0] ?? null;
    const secondChild = folder.m_child_folders?.[1] ?? null;

    if (firstChild?.m_folderID === layoutId) {
      return firstChild;
    }
    if (secondChild?.m_folderID === layoutId) {
      return secondChild;
    }
  }
  return undefined;
};

export const findFolderParentSpreadByPageId = (
  folders: Folder[],
  layoutId: number
) =>
  folders?.find((folder) => {
    const firstChild = folder.m_child_folders?.[0] ?? null;
    const secondChild = folder.m_child_folders?.[1] ?? null;
    const layouts = new Array<Folder>();
    if (firstChild) {
      layouts.push(firstChild);
    }
    if (secondChild) {
      layouts.push(secondChild);
    }
    return layouts.some((layout) => layout.m_folderID === layoutId);
  });

export const extractPageElements = (folder: Folder) => {
  const pageElements = new Array<Folder>();
  if (folder.m_child_folders?.[0]?.m_child_folders) {
    pageElements.push(
      ...folder.m_child_folders[0].m_child_folders.filter(
        (child): child is Folder => child !== null
      )
    );
  }
  if (folder.m_child_folders?.[1]?.m_child_folders) {
    pageElements.push(
      ...folder.m_child_folders[1].m_child_folders.filter(
        (child): child is Folder => child !== null
      )
    );
  }
  return pageElements;
};

export const swapElements = (
  sourceArray: Folder[],
  sourceIndex: number,
  targetArray: Folder[],
  targetIndex: number
): void => {
  const temp = sourceArray[sourceIndex].m_folderID;
  sourceArray[sourceIndex].m_folderID = targetArray[targetIndex].m_folderID;
  targetArray[targetIndex].m_folderID = temp;
};

export const buildBackgroundImageUrl = (
  pictureId: string,
  album: PhotoAlbum | null,
  user: User | null
) => {
  //support for epilogue page
  const action = pictureId.includes('ClientsPages')
    ? 'prologue_page'
    : 'snapshots';

  const queryParams: Record<string, string> = {
    format: album?.m_treeV5.m_format?.toString() ?? '',
    album_theme: album?.m_treeV5.m_album_theme ?? '',
    cover_family: album?.m_treeV5.m_cover_family ?? '',
    cover_theme: album?.m_treeV5.m_cover_theme ?? '',
    action: action,
    picture: String(pictureId || ''),
    size: 'medium',
    isCustomErr: 'false',
    cloudcode: env.CLOUD_CODE,
    app_version: '3.5.66.d',
    device_type: 'desktop',
    lang: 'he',
    token: user?.token ?? '',
    album_token: album?.m_treeV5.m_album_token ?? '',
  };

  // Cache-busting for epilogue/prologue images only
  if (pictureId.includes('ClientsPages')) {
    const flushCache = useLayoutTreeStore.getState().flushCache;
    queryParams.cache = flushCache;
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const imgUrl = `${env.RESOURCES_IMAGE_URL}?${queryString}`;

  return imgUrl;
};

export const createDropZoneDataPage = (
  layout?: Folder,
  layoutPage?: Folder
) => ({
  accepts: DraggableType.PAGE,
  pageId: layout?.m_folderID ?? 0,
  id: layoutPage?.m_folderID ?? 0,
  type: DropZoneType.PAGE,
});

export const getDraggablePageData = (
  layout: Folder,
  layoutPage: Folder,
  album: PhotoAlbum | null,
  layoutDimensions: { width: number; height: number },
  addTextToImage: (id: number, pageId: number, text: string) => void,
  eventToken: string,
  direction: number,
  imagesMap: Record<number, Image>
) => ({
  accepts: DraggableType.PAGE,
  type: DraggableType.PAGE,
  album: album,
  layoutWidth: layoutDimensions.width ?? 0,
  layoutHeight: layoutDimensions.height ?? 0,
  pageId: layout?.m_folderID ?? 0,
  dragType: DraggableType.PAGE,
  addTextToImage: addTextToImage,
  layoutId: layoutPage?.m_layoutID ?? 0,
  fontColor: 'unset',
  scale: 1,
  textBgColor: 'unset',
  eventToken: eventToken ?? '',
  direction: direction ?? 0,
  id: layoutPage?.m_folderID ?? 0,
  key: layoutPage?.m_folderID ?? 0,
  width: layoutDimensions.width ?? 0,
  height: layoutDimensions.height ?? 0,
  x: layout?.m_pivot?.X ?? 0,
  y: layout?.m_pivot?.Y ?? 0,
  imagesMap: imagesMap,
  imgFrameColor: layoutPage?.m_folder_frame?.m_image_or_color || 'unset',
});

const getSpreadImages = (spreadFolder: Folder | null): Folder[] | null => {
  if (!spreadFolder) return null;

  const images: Folder[] = [];

  // Get the images from the first page
  if (spreadFolder.m_child_folders?.[0]?.m_child_folders) {
    spreadFolder.m_child_folders[0].m_child_folders.forEach((folder) => {
      if (folder && folder.m_folderID) {
        images.push(folder);
      }
    });
  }
  //get the images from the second page
  if (spreadFolder.m_child_folders?.[1]?.m_child_folders) {
    spreadFolder.m_child_folders[1].m_child_folders.forEach((folder) => {
      if (folder && folder.m_folderID) {
        images.push(folder);
      }
    });
  }

  return images;
};

export const deletePageByPageId = (
  album: PhotoAlbum | null,
  pageId: number | null,
  setAlbum: (album: PhotoAlbum) => void,
  removeImagesFromTree: (
    layoutId: number,
    pageId: number,
    imagesId: number[],
    shouldUpdateTree: boolean
  ) => void
) => {
  if (!album || !pageId || pageId == 0) return;

  const updatedAlbum = structuredClone(album);
  // Fixes the issue of the album type not being updated in the store
  const isLayflat = isLayflatAlbum(album);

  //get the requested spread to delete
  const spreadFolders = getSpreadFolders(updatedAlbum);
  const spreadToDelete = spreadFolders.find((spreadFolder) =>
    spreadFolder.m_child_folders?.some(
      (childFolder) => childFolder?.m_folderID === pageId
    )
  );

  if (!spreadToDelete) return;

  const { currentPageIndex, setCurrentPageIndex } =
    useAlbumTreeStore.getState();

  const spreadIndexToDelete =
    album.m_treeV5.m_book_subtree.m_spread_folders?.findIndex(
      (folder) => folder.m_folderID === spreadToDelete.m_folderID
    ) ?? -1;

  const isCurrentPageBeingDeleted = currentPageIndex === spreadIndexToDelete;

  //get the images from spreadToDelete
  const imagesId = getSpreadImages(spreadToDelete)?.map(
    (img) => img.m_folderID
  );

  if (imagesId && imagesId.length > 0) {
    const folderPage = spreadToDelete.m_child_folders?.find(
      (layout) => layout?.m_folderID == pageId
    );
    const layoutId = folderPage?.m_layoutID ?? 0;
    //remove images from current page
    removeImagesFromTree(layoutId, pageId, imagesId, true);

    if (!isLayflat) {
      //get second page and remove its images
      const secondFolderPage = spreadToDelete.m_child_folders?.find(
        (layout) => layout?.m_folderID != pageId
      );
      const secondLayoutId = secondFolderPage?.m_layoutID ?? 0;
      removeImagesFromTree(
        secondLayoutId,
        secondFolderPage?.m_folderID ?? 0,
        imagesId,
        true
      );
    }
    const clear = useAlbumTreeStore.temporal.getState().clear;
    clear();
  }

  const currentAlbum: PhotoAlbum | null = useAlbumTreeStore.getState().album;
  if (!currentAlbum) return;

  const updateAlbum = structuredClone(currentAlbum);

  const spreadIndex =
    updateAlbum.m_treeV5.m_book_subtree.m_spread_folders?.findIndex(
      (folder) => folder.m_folderID === spreadToDelete.m_folderID
    );

  // Remove the spread from the album if found
  if (spreadIndex !== undefined && spreadIndex >= 0) {
    updateAlbum.m_treeV5.m_book_subtree.m_spread_folders?.splice(
      spreadIndex,
      1
    );
  }

  setAlbum(updateAlbum);

  if (isCurrentPageBeingDeleted) {
    const nextPageIndex = currentPageIndex + 1;
    setCurrentPageIndex(nextPageIndex);
  }
};

export const isValidAlbumForAddingPage = (album: PhotoAlbum): boolean => {
  return !!(
    album &&
    album.m_treeV5 &&
    album.m_treeV5.m_book_subtree &&
    album.m_treeV5.m_book_subtree.m_spread_folders.length
  );
};

export const getRandomInsertionIndex = (
  spreadFoldersLength: number
): number => {
  if (spreadFoldersLength <= 2) {
    return Math.floor(Math.random() * spreadFoldersLength);
  } else {
    const availableIndices = Array.from(
      { length: spreadFoldersLength - 2 },
      (_, i) => i + 1
    );
    const randomPosition = Math.floor(Math.random() * availableIndices.length);
    return availableIndices[randomPosition];
  }
};

export const updateChildFolders = (
  foldersToUpdate: Folder[],
  singleImageLayout: Layout,
  nextFolderId: number
): number => {
  for (const folder of foldersToUpdate) {
    if (folder) {
      folder.m_folderID = nextFolderId++;
      folder.m_layoutID = singleImageLayout.m_ID;

      if (folder.m_child_folders && folder.m_child_folders.length > 0) {
        const firstImageSlot = folder.m_child_folders[0];
        if (firstImageSlot) {
          firstImageSlot.m_folderID = 0;

          if (
            singleImageLayout.m_containers &&
            singleImageLayout.m_containers.length > 0
          ) {
            const container = singleImageLayout.m_containers[0];
            firstImageSlot.m_pivot = {
              IsEmpty: false,
              X: container.x,
              Y: container.y,
            };
            firstImageSlot.m_size = `${container.width},${container.height}`;
            firstImageSlot.m_layoutID = container.ID;
            // Set the type to EMPTY_CONTAINER since it's a new layout slot without an image
            firstImageSlot.m_type = folderMtypeEnum.EMPTY_CONTAINER;
          }
          folder.m_child_folders = [firstImageSlot];
        }
      }
    }
  }
  return nextFolderId;
};

export const createFolderCopy = (
  randomFolder: Folder,
  nextFolderId: number,
  isLayflat: boolean
): { folderCopy: Folder; updatedNextFolderId: number } => {
  const folderCopy = JSON.parse(JSON.stringify(randomFolder));
  folderCopy.m_folderID = nextFolderId++;

  const singleImageLayout = isLayflat
    ? useLayoutTreeStore.getState().getRandomFromGroupByLayflatCount(1)
    : useLayoutTreeStore.getState().getRandomFromGroupBySpreadCount(1);

  if (folderCopy.m_child_folders && folderCopy.m_child_folders.length > 0) {
    const foldersToUpdate = isLayflat
      ? [folderCopy.m_child_folders[0]]
      : folderCopy.m_child_folders;

    nextFolderId = updateChildFolders(
      foldersToUpdate,
      singleImageLayout,
      nextFolderId
    );
  }

  return { folderCopy, updatedNextFolderId: nextFolderId };
};
