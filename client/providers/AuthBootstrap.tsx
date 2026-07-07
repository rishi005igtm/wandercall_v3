'use client';

import React, { useEffect } from 'react';
import { useAppDispatch } from '@/lib/store/store';
import { setAuthReady, setAuthSession, clearAuthSession } from '@/lib/store/slices/authSlice';
import { userService } from '@/lib/services/user.service';
import { httpClient } from '@/lib/api/httpClient';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function bootstrapAuth() {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('wc_access_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('wc_refresh_token') : null;

      if (!accessToken && !refreshToken) {
        dispatch(clearAuthSession());
        dispatch(setAuthReady(true));
        return;
      }

      try {
        const currentUser = await userService.getCurrentUser();
        const latestAccessToken = typeof window !== 'undefined' ? localStorage.getItem('wc_access_token') : null;
        const latestRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('wc_refresh_token') : null;

        dispatch(
          setAuthSession({
            accessToken: latestAccessToken || accessToken || 'session_active',
            refreshToken: latestRefreshToken || refreshToken || 'session_active',
            user: {
              id: currentUser.userId,
              email: currentUser.email || `${currentUser.username}@wandercall.io`,
              name: currentUser.displayName,
              accountStatus: currentUser.accountStatus,
              isEmailVerified: currentUser.isEmailVerified ?? true,
              role: currentUser.role,
            },
          })
        );
      } catch (error) {
        if (refreshToken) {
          try {
            const { data } = await httpClient.post('/auth/refresh', { refreshToken });
            if (data?.accessToken) {
              dispatch(
                setAuthSession({
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken || refreshToken,
                  user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    accountStatus: data.user.accountStatus,
                    role: data.user.role,
                  },
                })
              );
            } else {
              dispatch(clearAuthSession());
            }
          } catch {
            dispatch(clearAuthSession());
          }
        } else {
          dispatch(clearAuthSession());
        }
      } finally {
        dispatch(setAuthReady(true));
      }
    }

    bootstrapAuth();
  }, [dispatch]);

  return <>{children}</>;
}
