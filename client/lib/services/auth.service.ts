import { httpClient } from '../api/httpClient';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    accountStatus: 'PROFILE_INCOMPLETE' | 'ACTIVE' | string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  ipAddress: string;
  isRevoked: boolean;
  isCurrent?: boolean;
  lastActive?: string;
  expiresAt: string;
  createdAt: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async googleAuth(payload: GoogleAuthPayload): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/google', payload);
    return data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const { data } = await httpClient.post<AuthResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  async logout(userId: string): Promise<void> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('wc_refresh_token') : null;
    await httpClient.post('/auth/logout', { userId, refreshToken });
  },

  async verifyEmail(email: string, code: string): Promise<{ verified: boolean; message: string }> {
    const { data } = await httpClient.post<{ verified: boolean; message: string }>('/auth/verify-email', { email, code });
    return data;
  },

  async getActiveSessions(): Promise<UserSession[]> {
    const { data } = await httpClient.get<UserSession[]>('/auth/sessions');
    return data;
  },

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>(`/auth/sessions/revoke/${sessionId}`);
    return data;
  },

  async revokeOtherSessions(): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>('/auth/sessions/revoke-others');
    return data;
  },

  async revokeAllSessions(): Promise<{ message: string }> {
    const { data } = await httpClient.post<{ message: string }>('/auth/sessions/revoke-all');
    return data;
  },
};
