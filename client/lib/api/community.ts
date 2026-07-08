import { httpClient } from './httpClient';

export interface CreateCommunityDto {
  name: string;
  slug: string;
  description?: string;
  primaryCategoryId: string;
  visibility?: string;
  coordinateId?: string;
  avatar?: string;
  cover?: string;
}

export interface UpdateCommunityDto extends Partial<CreateCommunityDto> {}

export interface UpdateCommunitySettingsDto {
  approvalRequired?: boolean;
  public?: boolean;
  private?: boolean;
  hidden?: boolean;
  allowInvite?: boolean;
  allowStories?: boolean;
  allowChat?: boolean;
  discoverable?: boolean;
  joinPolicy?: string;
  language?: string;
  region?: string;
}

export interface CommunityStatisticsDto {
  communityId: string;
  memberCount: number;
  activeMembers: number;
  onlineMembers: number;
  storyCount: number;
  postCount: number;
  chatCount: number;
  growth: number;
  updatedAt: string;
}

export interface CommunityMemberDto {
  id: string;
  communityId: string;
  userId: string;
  joinedAt: string;
  updatedAt: string;
  roleId: string | null;
  joinedBy: string | null;
  isMuted: boolean;
  mutedUntil: string | null;
  isOwner: boolean;
  nickname: string | null;
  lastSeenAt: string | null;
  status: string;
  createdAt: string;
  // User relations
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }
}

export interface CommunityDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar: string;
  cover: string;
  visibility: string;
  ownerId: string;
  primaryCategoryId: string;
  memberLimit: number;
  currentMemberCount: number;
  verified: boolean;
  official: boolean;
  isLive?: boolean;
  onlineMemberCount?: number;
  activeMemberCount?: number;
  statistics?: CommunityStatisticsDto;
  owner?: CommunityMemberDto;
  primaryCategory?: { id: string; name: string; slug: string };
}

export const communityApi = {
  create: async (data: CreateCommunityDto) => {
    const res = await httpClient.post('/communities', data);
    return res.data;
  },
  
  getMyCommunities: async () => {
    const res = await httpClient.get('/communities/me');
    return res.data;
  },
  
  getBySlug: async (slug: string) => {
    const res = await httpClient.get(`/communities/${slug}`);
    return res.data;
  },

  update: async (id: string, data: UpdateCommunityDto) => {
    const res = await httpClient.patch(`/communities/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
    const res = await httpClient.delete(`/communities/${id}`);
    return res.data;
  },

  getSettings: async (id: string) => {
    const res = await httpClient.get(`/communities/${id}/settings`);
    return res.data;
  },

  updateSettings: async (id: string, data: UpdateCommunitySettingsDto) => {
    const res = await httpClient.patch(`/communities/${id}/settings`, data);
    return res.data;
  },

  join: async (id: string) => {
    const res = await httpClient.post(`/communities/${id}/members/join`);
    return res.data;
  },

  leave: async (id: string) => {
    const res = await httpClient.post(`/communities/${id}/members/leave`);
    return res.data;
  },

  save: async (id: string) => {
    const res = await httpClient.post(`/communities/${id}/save`);
    return res.data;
  },

  unsave: async (id: string) => {
    const res = await httpClient.delete(`/communities/${id}/save`);
    return res.data;
  },

  search: async (query: string, limit = 20, cursor?: string) => {
    const res = await httpClient.get('/discovery/communities/search', {
      params: { q: query, limit, cursor },
    });
    return res.data;
  },

  getGalaxy: async (categoryId?: string) => {
    const res = await httpClient.get('/discovery/communities/galaxy', {
      params: { categoryId },
    });
    return res.data;
  },

  getCategories: async () => {
    const res = await httpClient.get('/discovery/communities/categories');
    return res.data;
  },

  getCoordinates: async (categoryId?: string) => {
    const res = await httpClient.get('/discovery/communities/coordinates', {
      params: { categoryId },
    });
    return res.data;
  },

  // --- Membership endpoints ---
  acceptInvite: async (inviteId: string) => {
    const res = await httpClient.post(`/communities/invites/${inviteId}/accept`);
    return res.data;
  },

  declineInvite: async (inviteId: string) => {
    const res = await httpClient.post(`/communities/invites/${inviteId}/decline`);
    return res.data;
  },

  inviteMember: async (communityId: string, targetUserId: string) => {
    const res = await httpClient.post(`/communities/${communityId}/members/invite/${targetUserId}`);
    return res.data;
  },

  kickMember: async (communityId: string, targetUserId: string) => {
    const res = await httpClient.delete(`/communities/${communityId}/members/${targetUserId}/kick`);
    return res.data;
  },

  banMember: async (communityId: string, targetUserId: string, reason?: string, permanent = true, expiresAt?: string) => {
    const res = await httpClient.post(`/communities/${communityId}/members/${targetUserId}/ban`, { reason, permanent, expiresAt });
    return res.data;
  },

  muteMember: async (communityId: string, targetUserId: string, durationMinutes: number) => {
    const res = await httpClient.post(`/communities/${communityId}/members/${targetUserId}/mute`, { durationMinutes });
    return res.data;
  },

  transferOwnership: async (communityId: string, newOwnerId: string) => {
    const res = await httpClient.put(`/communities/${communityId}/members/transfer-ownership`, { newOwnerId });
    return res.data;
  },

  updateRole: async (communityId: string, targetUserId: string, roleId: string, reason?: string) => {
    const res = await httpClient.put(`/communities/${communityId}/members/${targetUserId}/role`, { roleId, reason });
    return res.data;
  },

  searchMembers: async (communityId: string, query: string, limit = 20, cursor?: string) => {
    const res = await httpClient.get(`/communities/${communityId}/members/search`, {
      params: { q: query, limit, cursor },
    });
    return res.data;
  },

  warnMember: async (communityId: string, targetUserId: string, reason: string) => {
    const res = await httpClient.post(`/communities/${communityId}/members/${targetUserId}/warn`, { reason });
    return res.data;
  },

  unmuteMember: async (communityId: string, targetUserId: string, reason?: string) => {
    const res = await httpClient.post(`/communities/${communityId}/members/${targetUserId}/unmute`, { reason });
    return res.data;
  },

  unbanMember: async (communityId: string, targetUserId: string, reason?: string) => {
    const res = await httpClient.post(`/communities/${communityId}/members/${targetUserId}/unban`, { reason });
    return res.data;
  },

  getMemberHistory: async (communityId: string, targetUserId: string) => {
    const res = await httpClient.get(`/communities/${communityId}/members/${targetUserId}/history`);
    return res.data;
  },

  getAuditLogs: async (communityId: string, params?: { actorId?: string; targetUserId?: string; action?: string; limit?: number; cursor?: string }) => {
    const res = await httpClient.get(`/communities/${communityId}/audit-logs`, { params });
    return res.data;
  },

  getAnalytics: async (communityId: string) => {
    const res = await httpClient.get(`/communities/${communityId}/analytics`);
    return res.data;
  },

  getAllRoles: async () => {
    const res = await httpClient.get('/communities/roles/all');
    return res.data;
  },

  createRole: async (data: { name: string; displayName: string; displayColor?: string; priority?: number; permissions?: string[] }) => {
    const res = await httpClient.post('/communities/roles', data);
    return res.data;
  },

  updateCustomRole: async (roleId: string, data: { displayName?: string; displayColor?: string; priority?: number; permissions?: string[] }) => {
    const res = await httpClient.patch(`/communities/roles/${roleId}`, data);
    return res.data;
  },

  deleteRole: async (roleId: string) => {
    const res = await httpClient.delete(`/communities/roles/${roleId}`);
    return res.data;
  },

  pinStory: async (communityId: string, storyId: string, isPinned = true) => {
    const res = await httpClient.patch(`/communities/${communityId}/stories/${storyId}/pin`, { isPinned });
    return res.data;
  },

  featureStory: async (communityId: string, storyId: string, isFeatured = true) => {
    const res = await httpClient.patch(`/communities/${communityId}/stories/${storyId}/feature`, { isFeatured });
    return res.data;
  },

  deleteStory: async (communityId: string, storyId: string, reason?: string) => {
    const res = await httpClient.delete(`/communities/${communityId}/stories/${storyId}`, { data: { reason } });
    return res.data;
  },
};
