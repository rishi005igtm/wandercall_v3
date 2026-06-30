import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
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

export function usePublicProfileQuery(username: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PUBLIC_PROFILE(username),
    queryFn: () => userService.getPublicProfile(username),
    enabled: Boolean(username) && enabled,
    staleTime: 30 * 1000,
  });
}

export function useRelationshipQuery(username: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.USER.RELATIONSHIP(username),
    queryFn: () => userService.getRelationshipState(username),
    enabled: Boolean(username) && enabled,
    staleTime: 10 * 1000,
  });
}

export function useFollowersInfiniteQuery(username: string, search?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.USER.FOLLOWERS(username, search),
    queryFn: ({ pageParam }) => userService.getFollowers(username, 10, pageParam, search),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(username) && enabled,
  });
}

export function useFollowingInfiniteQuery(username: string, search?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.USER.FOLLOWING(username, search),
    queryFn: ({ pageParam }) => userService.getFollowing(username, 10, pageParam, search),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: Boolean(username) && enabled,
  });
}
