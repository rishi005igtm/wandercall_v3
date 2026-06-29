import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, GoogleAuthPayload, LoginPayload, RegisterPayload } from '../../lib/services/auth.service';
import { setAuthSession, setEmailVerified, clearAuthSession } from '../../lib/store/slices/authSlice';
import { useAppDispatch } from '../../lib/store/store';
import { mapApiError } from '../../lib/utils/errorMapper';

export function useSignupMutation() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      dispatch(setAuthSession(data));
    },
  });
}

export function useVerifyEmailMutation() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => authService.verifyEmail(email, code),
    onSuccess: (data) => {
      dispatch(setEmailVerified(true));
    },
  });
}

export function useLoginMutation() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      dispatch(setAuthSession(data));
      if (data.user.accountStatus === 'PROFILE_INCOMPLETE') {
        router.push(`/signup/complete?name=${encodeURIComponent(data.user.name)}&email=${encodeURIComponent(data.user.email)}`);
      } else {
        router.push('/');
      }
    },
  });
}

export function useGoogleAuthMutation() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: GoogleAuthPayload) => authService.googleAuth(payload),
    onSuccess: (data) => {
      dispatch(setAuthSession(data));
      if (data.user.accountStatus === 'PROFILE_INCOMPLETE') {
        router.push(`/signup/complete?name=${encodeURIComponent(data.user.name)}&email=${encodeURIComponent(data.user.email)}`);
      } else {
        router.push('/');
      }
    },
  });
}

export function useLogoutMutation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (userId: string) => authService.logout(userId),
    onSuccess: () => {
      dispatch(clearAuthSession());
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useActiveSessionsQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authService.getActiveSessions(),
    enabled,
    staleTime: 30 * 1000,
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
  });
}

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.revokeOtherSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
  });
}

export function useRevokeAllSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] });
    },
  });
}
