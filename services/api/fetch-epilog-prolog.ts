import { getApiUrl } from './config';

export type LegacyEpilogPrologData = {
  text_str: string;
  font_family: string;
  font_size: number;
  font_color: string;
  bg_color: string;
  direction: string;
  qrlink: string;
};

export type EpilogPrologTextSettings = {
  font_size: number;
  font_family: string;
  max_width_field: number;
  max_line_count: number;
};

export type EpilogPrologTextSection = {
  align: string;
  style: string;
  text: string;
  settings: EpilogPrologTextSettings;
};

export type StructuredEpilogPrologData = {
  header?: EpilogPrologTextSection;
  title?: EpilogPrologTextSection;
  body?: EpilogPrologTextSection;
  footer?: EpilogPrologTextSection;
  qrlink?: string;
  direction?: string;
  font_color?: string;
  bg_color?: string;
};

export type EpilogPrologData =
  | LegacyEpilogPrologData
  | StructuredEpilogPrologData;

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
  return (data.payload as EpilogPrologData | null) ?? null;
};
