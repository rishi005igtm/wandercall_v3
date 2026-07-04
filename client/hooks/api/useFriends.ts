import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/httpClient';

export interface FriendPreview {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  compatibility: number;
}

export interface FriendsResponse {
  items: FriendPreview[];
  nextCursor?: string;
}

export const useFriends = (limit = 10, search = '') => {
  return useInfiniteQuery({
    queryKey: ['friends', 'list', search],
    queryFn: async ({ pageParam = undefined }): Promise<FriendsResponse> => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);
      if (search) params.append('search', search);

      const response = await httpClient.get(`/friends?${params.toString()}`);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const usePendingIncoming = (limit = 10, search = '') => {
  return useInfiniteQuery({
    queryKey: ['friends', 'pending', 'incoming', search],
    queryFn: async ({ pageParam = undefined }): Promise<FriendsResponse> => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);
      if (search) params.append('search', search);

      const response = await httpClient.get(`/friends/pending/incoming?${params.toString()}`);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const usePendingOutgoing = (limit = 10, search = '') => {
  return useInfiniteQuery({
    queryKey: ['friends', 'pending', 'outgoing', search],
    queryFn: async ({ pageParam = undefined }): Promise<FriendsResponse> => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);
      if (search) params.append('search', search);

      const response = await httpClient.get(`/friends/pending/outgoing?${params.toString()}`);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useFollowBackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const response = await httpClient.post(`/friends/follow-back/${username}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate both pending requests and friends list
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      // Invalidate specific relationship state if cached
      queryClient.invalidateQueries({ queryKey: ['relationship', variables] });
    },
  });
};

export const useRejectRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const response = await httpClient.delete(`/friends/request/${username}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['relationship', variables] });
    },
  });
};

export const useCancelRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const response = await httpClient.delete(`/friends/request/${username}`);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['relationship', variables] });
    },
  });
};

export const useFavorites = () => {
  return useInfiniteQuery({
    queryKey: ['friends', 'favorites'],
    queryFn: async (): Promise<any[]> => {
      const response = await httpClient.get('/friends/favorites');
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
  });
};

export const useAddFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: string) => {
      const response = await httpClient.post(`/friends/favorites/${friendId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'favorites'] });
    },
  });
};

export const useRemoveFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (friendId: string) => {
      const response = await httpClient.delete(`/friends/favorites/${friendId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'favorites'] });
    },
  });
};

export const useReorderFavoritesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const response = await httpClient.patch('/friends/favorites/order', { orderedIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'favorites'] });
    },
  });
};
