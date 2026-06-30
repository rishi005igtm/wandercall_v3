import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  role: string;
  accountStatus: 'PROFILE_INCOMPLETE' | 'ACTIVE' | string | null;
  isEmailVerified: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isAuthReady: false,
  userId: null,
  email: null,
  name: null,
  role: 'INDIVIDUAL',
  accountStatus: null,
  isEmailVerified: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthReady: (state, action: PayloadAction<boolean>) => {
      state.isAuthReady = action.payload;
    },
    setAuthSession: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: string;
          email: string;
          name: string;
          accountStatus: string;
          isEmailVerified?: boolean;
          role?: string;
        };
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.userId = action.payload.user.id;
      state.email = action.payload.user.email;
      state.name = action.payload.user.name;
      state.accountStatus = action.payload.user.accountStatus;
      state.isEmailVerified = Boolean(action.payload.user.isEmailVerified);
      if (action.payload.user.role) {
        state.role = action.payload.user.role;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('wc_access_token', action.payload.accessToken);
        localStorage.setItem('wc_refresh_token', action.payload.refreshToken);
      }
    },
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;
    },
    updateAccountStatus: (state, action: PayloadAction<string>) => {
      state.accountStatus = action.payload;
    },
    clearAuthSession: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.userId = null;
      state.email = null;
      state.name = null;
      state.accountStatus = null;
      state.isEmailVerified = false;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('wc_access_token');
        localStorage.removeItem('wc_refresh_token');
      }
    },
  },
});

export const { setAuthReady, setAuthSession, setEmailVerified, updateAccountStatus, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
