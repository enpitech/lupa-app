import { PagesData } from '@/types/editor';
import { ENDPAPER_PAGE_IDS } from './appConst';

export const generateEndpaper = (
  { draggableData, dropZoneData, dropZoneStyle }: PagesData,
  isFirst: boolean = true,
  isLayflat: boolean = false
) => {
  const endpaperId = isFirst
    ? ENDPAPER_PAGE_IDS.FIRST_PAGE_ENDPAPER
    : ENDPAPER_PAGE_IDS.LAST_PAGE_ENDPAPER;
  return {
    layoutElement: { layout: null, layoutImage: [] },
    id: endpaperId,
    pageId: endpaperId,
    draggableData: { ...draggableData, pageId: endpaperId, id: endpaperId },
    dropZoneData: { ...dropZoneData, pageId: endpaperId, id: endpaperId },
    dropZoneStyle: isLayflat
      ? { ...dropZoneStyle, background: 'none' }
      : {
          ...dropZoneStyle,
          background: 'white',
          backgroundColor: 'white',
          backgroundImage: 'none',
        },
  };
};
