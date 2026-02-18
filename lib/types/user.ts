export interface User {
  name: string;
  email: string;
  isAuthenticated: boolean;
  firstName: string;
  isRegister: boolean;
  lastName: string;
  lupaWebIframe: string;
  refreshtoken: string;
  token: string;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserActions {
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refresh: (user: User) => Promise<void>;
  setUser: (user: User | null) => void;
}

export type UserStore = UserState & UserActions;
