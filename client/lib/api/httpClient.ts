import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { updateTokens, clearAuthSession } from '../store/slices/authSlice';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wc_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent refresh token rotation & error normalization
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('wc_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (data?.accessToken) {
            localStorage.setItem('wc_access_token', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('wc_refresh_token', data.refreshToken);
            }
            store.dispatch(
              updateTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken || refreshToken,
              })
            );
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            }
            return httpClient(originalRequest);
          }
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('wc_access_token');
          localStorage.removeItem('wc_refresh_token');
        }
        store.dispatch(clearAuthSession());
      }
    }

    return Promise.reject(error);
  }
);

