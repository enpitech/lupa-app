import { Image, PhotoAlbum } from '@/types/tree';
import { DragTypeEditor, DropZoneTypeEditor } from '@/types/editor';

export interface DraggableDataImage {
  type: DragTypeEditor;
  pageId: string | number;
  isCover: boolean;
  id: string | number;
  imageFromTree?: Record<number, Image>;
  size: { width: number; height: number };
  crop: { x: number; y: number; width: number; height: number };
  src: string;
  imageMediumWidth: number;
  imageMediumHeight: number;
  image_name: string;
}

export interface DraggableDataPage {
  layoutWidth: number;
  type: DragTypeEditor;
  layoutHeight: number;
  pageId: number;
  eventToken: string;
  layoutId: number;
  textBgColor: string;
  fontColor: string;
  addTextToImage: (id: number, pageId: number, text: string) => void;
  album: PhotoAlbum | null;
  id: number;
  key: number;
  dragType: DragTypeEditor | null;
  width: number;
  height: number;
  x: number;
  y: number;
  imagesMap: Record<number, Image>;
  imgFrameColor: string;
}

export interface DropZoneData {
  accepts: DragTypeEditor;
  pageId: string | number;
  layoutId?: number;
  id: string | number;
  containerId?: number;
  src?: string;
  source?: string;
  type: DropZoneTypeEditor;
}
