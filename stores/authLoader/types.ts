export type AuthLoaderStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface AuthLoaderState {
  status: AuthLoaderStatus;
  error: string | null;
}

export interface AuthLoaderActions {
  setStatus: (status: AuthLoaderStatus) => void;
  setError: (error: string | null) => void;
  setLoading: () => void;
  setAuthenticated: () => void;
  setUnauthenticated: () => void;
  reset: () => void;
  waitForAuthentication: () => Promise<boolean>;
}

export type AuthLoaderStore = AuthLoaderState & AuthLoaderActions;
