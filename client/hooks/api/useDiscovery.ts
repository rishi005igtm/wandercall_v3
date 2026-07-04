import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { httpClient } from '@/lib/api/httpClient';

export interface ExplorerCircleNode {
  id: string;
  name: string;
  username: string;
  avatar: string;
  compatibility: number;
  sharedDNA: "Explorer" | "Creative" | "Socializer";
  mutualExperiences: number;
  mutualCommunities: number;
  mutualFriends: number;
  bio: string;
  tags: string[];
  communities: string[];
  level?: number;
  reputationScore?: number;
  location?: string;
  isFollowing?: boolean;
  isFriend?: boolean;
  reasons?: string[];
}

export interface ExplorerCircleEdge {
  source: string;
  target: string;
  relationship: "FRIEND" | "MUTUAL_FRIEND" | "RECOMMENDED";
}

export interface ExplorerCirclesGraphResponse {
  nodes: ExplorerCircleNode[];
  edges: ExplorerCircleEdge[];
}

export interface RecommendationItem {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  compatibility: number;
  level: number;
  reputationScore: number;
  locationFormatted: string;
  bio: string;
  reasons?: string[];
  isFollowing?: boolean;
  isFriend?: boolean;
}

export interface SearchUserItem {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  level: number;
  reputationScore: number;
  locationFormatted: string;
  bio: string;
  compatibility: number;
}

export const useExplorerCirclesGraph = () => {
  return useQuery({
    queryKey: ['discovery', 'circles'],
    queryFn: async (): Promise<ExplorerCirclesGraphResponse> => {
      const response = await httpClient.get('/search/circles');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useFriendRecommendations = (limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['discovery', 'recommendations'],
    queryFn: async ({ pageParam = undefined }): Promise<{ items: RecommendationItem[]; nextCursor?: string }> => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);

      const response = await httpClient.get(`/search/recommendations?${params.toString()}`);
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useUserSearch = (query = '', filter = '', limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['search', 'users', query, filter],
    queryFn: async ({ pageParam = undefined, signal }): Promise<{ items: SearchUserItem[]; nextCursor?: string }> => {
      const trimmed = query.trim();
      // 0 characters -> fetch recommendations/trending instead of hitting search engine
      if (!trimmed) {
        const params = new URLSearchParams();
        params.append('limit', limit.toString());
        if (pageParam) params.append('cursor', pageParam);
        const response = await httpClient.get(`/search/recommendations?${params.toString()}`, { signal });
        const data = response.data;
        return {
          items: data?.items || (Array.isArray(data) ? data : []),
          nextCursor: data?.nextCursor,
        };
      }
      // 1 character -> ignore (return empty suggestions without hitting backend search)
      if (trimmed.length === 1) {
        return { items: [], nextCursor: undefined };
      }
      // 2+ characters -> actual search
      const params = new URLSearchParams();
      params.append('q', trimmed);
      if (filter && filter !== 'all') params.append('filter', filter);
      params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);

      const response = await httpClient.get(`/search/users?${params.toString()}`, { signal });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true,
  });
};

export const useSearchHistory = (limit = 10) => {
  return useQuery({
    queryKey: ['search', 'history'],
    queryFn: async (): Promise<any[]> => {
      const response = await httpClient.get(`/search/history?limit=${limit}`);
      return response.data;
    },
  });
};
