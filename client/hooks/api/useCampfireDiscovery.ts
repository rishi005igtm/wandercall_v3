import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campfireApi, CreateCampfireDto, CampfireDiscoveryResponse } from '../../lib/api/campfire';
import { QUERY_KEYS } from '../../lib/api/queryKeys';

export const useCreateCampfire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCampfireDto) => campfireApi.create(data),
    onSuccess: () => {
      // Invalidate relevant discovery caches when a new campfire is created
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
      queryClient.invalidateQueries({ queryKey: ['campfires', 'trending'] });
      queryClient.invalidateQueries({ queryKey: ['campfires', 'live'] });
      queryClient.invalidateQueries({ queryKey: ['campfires', 'recommended'] });
    },
  });
};

export const useSearchCampfires = (params: Record<string, any>) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.SEARCH(params),
    queryFn: async ({ pageParam = undefined, signal }): Promise<CampfireDiscoveryResponse> => {
      return campfireApi.search({ ...params, cursor: pageParam });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useTrendingCampfires = (params: Record<string, any> = {}) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.TRENDING(params),
    queryFn: async ({ pageParam = undefined }): Promise<CampfireDiscoveryResponse> => {
      return campfireApi.getTrending({ ...params, cursor: pageParam });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useLiveCampfires = (params: Record<string, any> = {}) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.LIVE(params),
    queryFn: async ({ pageParam = undefined }): Promise<CampfireDiscoveryResponse> => {
      return campfireApi.getLive({ ...params, cursor: pageParam });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};

export const useRecommendedCampfires = (params: Record<string, any> = {}) => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.RECOMMENDED(params),
    queryFn: async ({ pageParam = undefined }): Promise<CampfireDiscoveryResponse> => {
      return campfireApi.getRecommended({ ...params, cursor: pageParam });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
};
