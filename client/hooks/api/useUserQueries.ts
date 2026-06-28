import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../lib/api/queryKeys';
import { userService } from '../../lib/services/user.service';

export function useUserProfileQuery(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PROFILE(userId || 'guest'),
    queryFn: () => userService.getProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}

export function useUserSettingsQuery(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.SETTINGS(userId || 'guest'),
    queryFn: () => userService.getSettings(userId!),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}

export function useUserPlanQuery(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PLAN(userId || 'guest'),
    queryFn: () => userService.getPlan(userId!),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
  });
}
