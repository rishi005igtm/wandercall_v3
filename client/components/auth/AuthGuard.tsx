'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/store';
import { Loader2, Globe } from 'lucide-react';

const GUEST_ONLY_ROUTES = ['/login', '/signup', '/verify-email'];
const AUTH_ONLY_ROUTES = [
  '/profile',
  '/settings',
  '/bookings',
  '/wishlist',
  '/checkout',
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, isAuthReady, accountStatus, isEmailVerified } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!isAuthReady) return;

    const isGuestRoute = GUEST_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
    const isAuthRoute = AUTH_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
    const isSignupComplete = pathname === '/signup/complete';

    // 1. Guest-Only Route Redirection for Authenticated Users
    if (isAuthenticated && isGuestRoute) {
      if (accountStatus === 'PROFILE_INCOMPLETE') {
        router.replace('/signup/complete');
      } else {
        router.replace('/');
      }
      return;
    }

    // 2. Auth-Only Protected Route Enforcement
    if (isAuthRoute) {
      if (!isAuthenticated) {
        router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!isEmailVerified) {
        router.replace('/signup');
        return;
      }
      if (accountStatus === 'PROFILE_INCOMPLETE' && !isSignupComplete) {
        router.replace('/signup/complete');
        return;
      }
    }
  }, [isAuthenticated, isAuthReady, accountStatus, isEmailVerified, pathname, router]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen w-full bg-brand-bg flex flex-col items-center justify-center gap-4 text-white select-none">
        <div className="relative h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple shadow-xl shadow-brand-indigo/30">
          <Globe className="h-7 w-7 text-white animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-brand-cyan" />
          <span>Verifying Wandercall Identity Node...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
