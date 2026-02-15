import { AcceptScreenResponse } from '@/services/api/fetchAcceptScreen';

export interface AcceptScreenState {
  data: AcceptScreenResponse | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface AcceptScreenActions {
  setData: (data: AcceptScreenResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
  setInitialized: (initialized: boolean) => void;
}

export type AcceptScreenStore = AcceptScreenState & AcceptScreenActions;
