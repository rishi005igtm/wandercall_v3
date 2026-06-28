import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  name: string | null;
  accountStatus: 'PROFILE_INCOMPLETE' | 'ACTIVE' | string | null;
  isEmailVerified: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  userId: null,
  email: null,
  name: null,
  accountStatus: null,
  isEmailVerified: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
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

export const { setAuthSession, setEmailVerified, updateAccountStatus, clearAuthSession } = authSlice.actions;
export default authSlice.reducer;
