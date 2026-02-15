import {
  DraggableDataPage,
  DraggableDataImage,
} from '@/types/dnd';
import { DropZoneData } from '@/types/dnd';
import { Folder, Image, PhotoAlbum, Text } from '@/types/tree';
import { LayoutFamilyType } from '@/lib/TreeV5/utils/layouts';
import { CSSProperties } from 'react';

export type AlbumImageCardProps = {
  id: string;
  src: string;
  index: number;
  folderID: string;
};

export type AlbumPageProps = {
  id: string;
  title: string;
  images: AlbumImageCardProps[];
  layoutId: string;
  index: number;
};

export interface DragAndDropData {
  type: 'image' | 'page';
  accepts?: 'page';
  layoutId: string;
  id: string;
  index: number;
}

export interface DragEndHandlerParams {
  pages: AlbumPageProps[];
  draggedItem: DraggableDataPage | DraggableDataImage;
  droppableContainer: DragAndDropData;
}

export interface Format {
  id: string;
  title: string;
  format_index: number;
  size_horizontal: number;
  size_vertical: number;
  format_default: boolean;
  unavailable: boolean;
  covers: Cover[];
}

export interface MediaItem {
  thumb_url?: string;
  video_url?: string;
}

export interface MetaDataItem {
  icon: string;
  description: string;
  order: number;
}

export interface Cover {
  id: string;
  title: string;
  price_description: string;
  description: string;
  image_max: number;
  media: MediaItem[];
  meta_data: MetaDataItem[];
  temporary_disabled: boolean;
  densities: Density[];
  title_button: string;
}

export type PagesData = {
  id: number;
  draggableData: DraggableDataPage;
  dropZoneData: DropZoneData;
  dropZoneStyle: React.CSSProperties;
  layoutElement: { layout: Folder | null; layoutImage: Folder[] }[][number];
  pageId: number;
};
export type LayoutElement = {
  layout: Folder | null;
  layoutImage: Folder[];
}[][number];
export interface Density {
  id: string;
  title: string;
  brief: string;
  description: string;
  media: MediaItem[];
  meta_data: MetaDataItem[];
  footer: string;
  image_max: number;
}
export interface Direction {
  id: string;
  title: string;
  title_button: string;
  description: string;
  media: MediaItem[];
}

export interface CoverFamily {
  id: string;
  title: string;
  description: string;
  media: MediaItem[];
  subtitle: string;
  title_button: string;
}

export interface CropRect {
  X?: number;
  Y?: number;
  Width?: number;
  Height?: number;
}

export interface LayoutSlotProps {
  x: number;
  y: number;
  isCover: boolean;
  opacity: number;
  width: number;
  containerId: number;
  eventToken: string;
  textBgColor: string;
  textBgOpacity: number;
  fontColor: string;
  album: PhotoAlbum | null;
  dragType: DragTypeEditor | null;
  height: number;
  pageId: number;
  layoutId: number;
  id: number;
  layoutWidth: number;
  layoutHeight: number;
  imagesMap: Record<number, Image>;
  mode: PageMode;
  imgFrameColor: string;
  isLayFlat?: boolean;
  handleRemoveImageCurrentFolderImagesNum: () => void;
  layoutFamily?: LayoutFamilyType;
  isLastImageInLayout: boolean;
  dndDisabled?: boolean;
}
export type PageMode = 'sidebar' | 'editor' | 'preview';
export interface EditorPageLayoutContainerProps {
  layout: Folder;
  eventToken: string;
  images: Image[];
  texts?: Text[];
  album: PhotoAlbum | null;
  maxPageHeight: number;
  pageWidth: number;
  dragType: DragTypeEditor | null;
  setCurrentPageInFolder?: (currentPage: number) => void;
  mode: PageMode;
  handleRemoveImageCurrentFolderImagesNum: () => void;
  testId?: string;
  selected?: boolean;
  backgroundData?: {
    color: string;
    imageUrl: string;
  };
}

export interface LazyImageProps {
  src: string;
  size: { width: number; height: number };
  pageId: number | string;
  id: string | number;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mode?: PageMode;
  rotationRe?: number;
  isCover?: boolean;
  jpeg_orientation?: string;
  alignment?: number;
}

export enum DraggableType {
  IMAGE = 'image',
  PAGE = 'page',
  GRID_IMAGE = 'grid',
}

export type DragTypeEditor =
  | DraggableType.PAGE
  | DraggableType.IMAGE
  | DraggableType.GRID_IMAGE;
export enum DropZoneType {
  IMAGE = 'image',
  PAGE = 'page',
  ADD_IMAGE_TO_PAGE = 'add_image_to_page',
}
export type DropZoneTypeEditor =
  | DropZoneType.IMAGE
  | DropZoneType.PAGE
  | DropZoneType.ADD_IMAGE_TO_PAGE;

export interface TextSettings {
  font_size: number;
  font_family: string;
  max_width_field: number;
  max_line_count: number;
}

export interface TextSection {
  align: string;
  style: string;
  text: string;
  settings: TextSettings;
}

export interface FormTextData {
  title: TextSection;
  body: TextSection;
  footer: TextSection;
  qrlink: string;
}

export interface EmptyLayoutSlotProps {
  x: number;
  y: number;
  width: number;
  album?: PhotoAlbum | null;
  opacity: number;
  height: number;
  isSpine: boolean;
  direction: string;
  text: string;
  id: number;
  frameColor: string;
  textColor: string;
  layoutWidth: number;
  layoutHeight: number;
  spineWidth?: number;
  isCover?: boolean;
  isCoverPreview?: boolean;
  layoutFamily?: LayoutFamilyType;
  treeFontSizePx?: number;
}

export interface LayoutSlotImagePresenterProps {
  id: number;
  pageId: number;
  draggableData: DraggableDataPage | DraggableDataImage;
  dropZoneData: DropZoneData;
  slotStyle: CSSProperties;
  imageUrl: string;
  containerId: number;
  opacity: number;
  cropData: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  mode: PageMode;
  width: number;
  height: number;
  dragType: DraggableType | null;
  onEditImage: () => void;
  imageFromTree: Image | undefined;
  album: PhotoAlbum | null;
  fontColor: string;
  rotationRe?: number;
  alignment?: number;
  textBgColor: string;
  textBgOpacity: number;
  imgFrameColor: string;
  onRemoveImage: () => void;
  layoutFamily?: LayoutFamilyType;
  isCover?: boolean;
  isLastImageInLayout: boolean;
  dndDisabled?: boolean;
}
export interface LayoutSlotRendererProps {
  layoutImage: Folder[];
  layoutWidth: number;
  withSpine: boolean;
  layoutHeight: number;
  isCover: boolean;
  pageId: number;
  dragType: DragTypeEditor | null;
  eventToken: string;
  album: PhotoAlbum | null;
  mode: PageMode;
  layoutId: number;
  imagesMap: Record<number, Image>;
  isLayFlat?: boolean;
  handleRemoveImageCurrentFolderImagesNum: () => void;
  dndDisabled?: boolean;
}

export interface SlotPositioning {
  x: number;
  y: number;
  width: number;
  height: number;
  layoutWidth: number;
  layoutHeight: number;
  isSideBar?: boolean;
}
