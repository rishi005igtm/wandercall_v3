import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../lib/api/queryKeys';
import { userService } from '../../lib/services/user.service';

export function useCurrentUserQuery(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.CURRENT,
    queryFn: () => userService.getCurrentUser(),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useUserProfileQuery(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PROFILE(userId || 'me'),
    queryFn: () => userService.getProfile(userId || 'me'),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}

export function useUserSettingsQuery(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.SETTINGS(userId || 'me'),
    queryFn: () => userService.getSettings(userId || 'me'),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}

export function useUserPlanQuery(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PLAN(userId || 'me'),
    queryFn: () => userService.getPlan(userId || 'me'),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}
