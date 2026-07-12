'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '../lib/store/store';
import { AuthBootstrap } from './AuthBootstrap';
import { SocketProvider } from './SocketProvider';
import { CampfireSessionProvider } from './CampfireSessionProvider';
import { CampfireVoiceProvider } from './CampfireVoiceProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          {/* SocketProvider mounts after auth is bootstrapped so it always has the token */}
          <SocketProvider>
            <CampfireVoiceProvider>
              <CampfireSessionProvider>
                {children}
              </CampfireSessionProvider>
            </CampfireVoiceProvider>
          </SocketProvider>
        </AuthBootstrap>
      </QueryClientProvider>
    </Provider>
  );
}
