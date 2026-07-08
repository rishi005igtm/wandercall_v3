import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi, CreateCommunityDto, UpdateCommunityDto, UpdateCommunitySettingsDto } from '../lib/api/community';
import { QUERY_KEYS } from '../lib/api/queryKeys';

export const useCommunity = (slug: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITIES.DETAIL(slug),
    queryFn: () => communityApi.getBySlug(slug),
    enabled: !!slug,
  });
};

export const useCommunitySettings = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITIES.SETTINGS(id),
    queryFn: () => communityApi.getSettings(id),
    enabled: !!id,
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommunityDto) => communityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMUNITIES.ALL });
      queryClient.invalidateQueries({ queryKey: ['communities', 'galaxy'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['community', 'me'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.join(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMUNITIES.ALL });
      queryClient.invalidateQueries({ queryKey: ['community', 'me'] });
    },
  });
};

export const useDiscoverCommunities = (query: string, limit = 20) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITIES.SEARCH(query),
    queryFn: () => communityApi.search(query, limit),
    enabled: query.length > 0,
  });
};

export const useGalaxy = (categoryId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITIES.GALAXY(categoryId),
    queryFn: () => communityApi.getGalaxy(categoryId),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['community', 'categories'],
    queryFn: () => communityApi.getCategories(),
  });
};

export const useMyCommunities = () => {
  return useQuery({
    queryKey: ['community', 'me'],
    queryFn: () => communityApi.getMyCommunities(),
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMUNITIES.ALL });
      queryClient.invalidateQueries({ queryKey: ['community', 'me'] });
    },
  });
};

export const useInviteMember = () => {
  return useMutation({
    mutationFn: ({ communityId, targetUserId }: { communityId: string, targetUserId: string }) => 
      communityApi.inviteMember(communityId, targetUserId),
  });
};

export const useKickMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, targetUserId }: { communityId: string, targetUserId: string }) => 
      communityApi.kickMember(communityId, targetUserId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId, 'members'] });
      }
  });
};

export const useBanMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, targetUserId, reason, permanent, expiresAt }: { communityId: string, targetUserId: string, reason?: string, permanent?: boolean, expiresAt?: string }) => 
      communityApi.banMember(communityId, targetUserId, reason, permanent, expiresAt),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId, 'members'] });
      }
  });
};

export const useMuteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, targetUserId, durationMinutes }: { communityId: string, targetUserId: string, durationMinutes: number }) => 
      communityApi.muteMember(communityId, targetUserId, durationMinutes),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId, 'members'] });
      }
  });
};

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, newOwnerId }: { communityId: string, newOwnerId: string }) => 
      communityApi.transferOwnership(communityId, newOwnerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMUNITIES.ALL });
      queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId, 'members'] });
    }
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ communityId, targetUserId, roleId }: { communityId: string, targetUserId: string, roleId: string }) => 
      communityApi.updateRole(communityId, targetUserId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['communities', variables.communityId, 'members'] });
    }
  });
};

export const useSearchCommunityMembers = (communityId: string, query: string = '', limit = 20) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMUNITIES.MEMBERS(communityId, query),
    queryFn: () => communityApi.searchMembers(communityId, query, limit),
    enabled: !!communityId,
  });
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => communityApi.acceptInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMMUNITIES.ALL });
      queryClient.invalidateQueries({ queryKey: ['community', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['communities', 'galaxy'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
};

export const useDeclineInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => communityApi.declineInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
};
