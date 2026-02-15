import { create } from 'zustand';
import { fetchFormats } from '@/services/api/fetchFormats';
import { WizardDataStore, GetFormatsResponse } from './types';
import { trackError } from '@/utils/datadogErrorTracking';

const useWizardDataStore = create<WizardDataStore>((set, get) => ({
  data: undefined,
  isLoading: false,
  error: null,
  eventToken: '',
  lang: '',

  setData: (data: GetFormatsResponse | undefined) => set({ data }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: Error | null) => set({ error }),

  setEventToken: (eventToken: string) => set({ eventToken }),

  setLang: (lang: string) => set({ lang }),

  fetchFormats: async () => {
    const { eventToken, lang } = get();

    if (!eventToken || !lang) {
      set({ error: new Error('Event token and language are required') });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await fetchFormats({ eventToken, lang });
      set({ data, isLoading: false });
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error('Failed to fetch formats');

      trackError(errorObj, {
        errorType: 'store_error',
        store: 'wizardData',
        action: 'fetchFormats',
        eventToken,
        lang,
      });

      set({
        error: errorObj,
        isLoading: false,
      });
    }
  },

  reset: () =>
    set({
      data: undefined,
      isLoading: false,
      error: null,
      eventToken: '',
      lang: '',
    }),
}));

export default useWizardDataStore;
export type {
  WizardDataStore,
  GetFormatsResponse,
  WizardDataPayload,
} from './types';
