import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/httpClient';

export interface PrivacyRelation {
  id: string;
  userId: string;
  targetUserId: string;
  isBlocked: boolean;
  isMuted: boolean;
  isRestricted: boolean;
  reason?: string;
  createdAt: string;
  targetUser?: {
    userId: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface PrivacyResponse {
  items: PrivacyRelation[];
  nextCursor?: string;
}

export const useBlockedUsers = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['privacy', 'blocked'],
    queryFn: async ({ pageParam = undefined }): Promise<PrivacyResponse> => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);

      const response = await httpClient.get(`/privacy/blocked?${params.toString()}`);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useBlockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetUsername, reason }: { targetUsername: string; reason?: string }) => {
      const response = await httpClient.post(`/privacy/block/${targetUsername}`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy', 'blocked'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
    },
  });
};

export const useUnblockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetUsername: string) => {
      const response = await httpClient.delete(`/privacy/block/${targetUsername}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy', 'blocked'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
    },
  });
};
