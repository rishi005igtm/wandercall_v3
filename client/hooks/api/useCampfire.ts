import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campfireApi, CreateCampfireDto } from '../../lib/api/campfire';
import { QUERY_KEYS } from '../../lib/api/queryKeys';

export const useCampfire = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.DETAIL(id),
    queryFn: () => campfireApi.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useUpdateCampfire = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<CreateCampfireDto>) => campfireApi.update(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.CAMPFIRES.DETAIL(id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    },
  });
};

export const useDeleteCampfire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campfireApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.CAMPFIRES.DETAIL(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    },
  });
};

export const useStartCampfire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campfireApi.start(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(QUERY_KEYS.CAMPFIRES.DETAIL(id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    },
  });
};

export const useEndCampfire = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => campfireApi.end(id),
    onSuccess: (data, id) => {
      queryClient.setQueryData(QUERY_KEYS.CAMPFIRES.DETAIL(id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CAMPFIRES.ALL });
    },
  });
};

export const useCampfireSearch = (params: Record<string, any>, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.SEARCH(params),
    queryFn: () => campfireApi.search(params),
    enabled: options?.enabled !== false,
  });
};

export const useCreateCampfire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampfireDto) => campfireApi.create(data),
    onSuccess: (newCampfire) => {
      queryClient.setQueryData(QUERY_KEYS.CAMPFIRES.DETAIL(newCampfire.id), newCampfire);
      queryClient.invalidateQueries({ queryKey: ['campfires'] });
    },
  });
};

export const useToggleReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campfireApi.remind(id),
    onSuccess: (data, id) => {
      if (data.campfire) {
        queryClient.setQueryData(QUERY_KEYS.CAMPFIRES.DETAIL(id), data.campfire);
      }
      queryClient.invalidateQueries({ queryKey: ['campfires'] });
    },
  });
};

export const useWorkspaceCampfires = (tab: 'hosted' | 'joined' | 'saved', options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.WORKSPACE(tab),
    queryFn: () => campfireApi.getWorkspace(tab),
    enabled: options?.enabled !== false,
  });
};

export const useLiveCampfires = (params: Record<string, any> = {}, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: QUERY_KEYS.CAMPFIRES.LIVE(params),
    queryFn: () => campfireApi.getLive(params),
    enabled: options?.enabled !== false,
  });
};

