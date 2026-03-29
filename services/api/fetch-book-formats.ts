import { apiMethods, getApiUrl } from './config';

export interface BookDensity {
  id: string;
  title: string;
}

export interface BookCover {
  id: string;
  title: string;
  title_button: string;
  densities: BookDensity[];
}

export interface BookFormat {
  id: string;
  title: string;
  format_index: number;
  format_default: boolean;
  covers: BookCover[];
}

export interface BookDirection {
  id: string;
  title: string;
}

export interface BookFormatsPayload {
  formats: BookFormat[];
  bookDirections: BookDirection[];
}

export const fetchBookFormats = async ({
  eventToken,
  lang,
}: {
  eventToken: string;
  lang: string;
}): Promise<BookFormatsPayload> => {
  const url = getApiUrl({
    method: apiMethods.getbookformats,
    params: { event_token: eventToken, lang },
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

  const data = await response.json();
  if (!data.isValid) throw new Error(data.Error ?? `API error: ${data.errorCode}`);

  return data.payload as BookFormatsPayload;
};
