import { getApiUrl } from './config';

export type EpilogPrologData = {
  text_str: string;
  font_family: string;
  font_size: number;
  font_color: string;
  bg_color: string;
  direction: string;
  qrlink: string;
};

export const fetchEpilogProlog = async ({
  eventToken,
  isEpilog,
  lang = 'en',
}: {
  eventToken: string;
  isEpilog: boolean;
  lang?: string;
}): Promise<EpilogPrologData | null> => {
  const response = await fetch(
    getApiUrl({
      method: 'getepiprotextpage',
      params: {
        event_token: eventToken,
        lang,
        is_epilog: isEpilog.toString(),
      },
    })
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.payload ?? null;
};
