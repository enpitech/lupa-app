import { Format, CoverFamily ,Direction} from '@/types/editor';



export interface WizardDataPayload {
  formats: Format[];
  bookDirections: Direction[];
  cover_families: CoverFamily[];
}

export interface GetFormatsResponse {
  payload: WizardDataPayload;
}

export interface WizardDataStore {
  data: GetFormatsResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  eventToken: string;
  lang: string;

  // Actions
  setData: (data: GetFormatsResponse | undefined) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setEventToken: (eventToken: string) => void;
  setLang: (lang: string) => void;
  fetchFormats: () => Promise<void>;
  reset: () => void;
}
