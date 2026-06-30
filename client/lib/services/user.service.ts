import { httpClient } from '../api/httpClient';

export interface CompleteProfilePayload {
  userId: string;
  username: string;
  displayName?: string;
  bio?: string;
  locationFormatted?: string;
  locationLat?: number;
  locationLon?: number;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  userId: string;
  username: string;
  displayName: string;
  email?: string;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  avatarPublicId?: string;
  bio?: string;
  locationFormatted?: string;
  locationLat?: number;
  locationLon?: number;
  isPrivate: boolean;
  profileUrl?: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  phoneCoordinate?: string;
  level: number;
  xpCurrent: number;
  xpNext: number;
  reputationScore: number;
  adventuresCompleted: number;
  communitiesJoined: number;
  campfiresHosted: number;
  followerCount?: number;
  followingCount?: number;
  relationshipState?: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self';
  dnaBadges?: any;
  accountStatus: 'PROFILE_INCOMPLETE' | 'ACTIVE' | string;
  createdAt: string;
}

export interface UserSettingsResponse {
  userId: string;
  is2faEnabled: boolean;
  privacyMatrix: Record<string, string>;
  notifications: Record<string, boolean>;
  travelRadius: number;
  budgetRange: number;
  difficulty: string;
  selectedTags: string[];
  connectedNetworks: Record<string, any>;
}

export interface UserPlanResponse {
  userId: string;
  selectedTier: string;
  billingCycle: string;
  price: number;
  status: string;
  nextBillDate?: string;
  paymentCard: { name: string; number: string; expiry: string; cvv: string } | null;
}

export const userService = {
  async getCurrentUser(): Promise<UserProfileResponse> {
    const { data } = await httpClient.get<UserProfileResponse>('/users/me');
    return data;
  },

  async getMyProfile(): Promise<UserProfileResponse> {
    const { data } = await httpClient.get<UserProfileResponse>('/users/profile/me');
    return data;
  },

  async getMySettings(): Promise<UserSettingsResponse> {
    const { data } = await httpClient.get<UserSettingsResponse>('/users/settings/me');
    return data;
  },

  async getMyPlan(): Promise<UserPlanResponse> {
    const { data } = await httpClient.get<UserPlanResponse>('/users/plan/me');
    return data;
  },

  async completeProfile(payload: CompleteProfilePayload): Promise<UserProfileResponse> {
    const { data } = await httpClient.post<UserProfileResponse>('/users/profile/complete', payload);
    return data;
  },

  async checkUsername(username: string): Promise<{ available: boolean; username: string }> {
    const { data } = await httpClient.get<{ available: boolean; username: string }>(
      `/users/username/check`,
      { params: { username } }
    );
    return data;
  },

  async getUsernameSuggestions(name: string): Promise<{ suggestions: string[] }> {
    const { data } = await httpClient.get<{ suggestions: string[] }>(
      `/users/username/suggestions`,
      { params: { name } }
    );
    return data;
  },

  async getProfile(userId: string): Promise<UserProfileResponse> {
    if (userId === 'me') return this.getMyProfile();
    const { data } = await httpClient.get<UserProfileResponse>(`/users/profile/${userId}`);
    return data;
  },

  async updateProfile(userId: string, payload: Partial<UserProfileResponse>): Promise<UserProfileResponse> {
    const { data } = await httpClient.patch<UserProfileResponse>(`/users/profile/${userId}`, payload);
    return data;
  },

  async getSettings(userId: string): Promise<UserSettingsResponse> {
    if (userId === 'me') return this.getMySettings();
    const { data } = await httpClient.get<UserSettingsResponse>(`/users/settings/${userId}`);
    return data;
  },

  async updateSettings(userId: string, payload: Partial<UserSettingsResponse>): Promise<UserSettingsResponse> {
    const { data } = await httpClient.patch<UserSettingsResponse>(`/users/settings/${userId}`, payload);
    return data;
  },

  async getPlan(userId: string): Promise<UserPlanResponse> {
    if (userId === 'me') return this.getMyPlan();
    const { data } = await httpClient.get<UserPlanResponse>(`/users/plan/${userId}`);
    return data;
  },

  async updatePlan(userId: string, payload: Partial<UserPlanResponse>): Promise<UserPlanResponse> {
    const { data } = await httpClient.patch<UserPlanResponse>(`/users/plan/${userId}`, payload);
    return data;
  },

  async uploadAvatar(file: File): Promise<UserProfileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await httpClient.post<UserProfileResponse>('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async uploadCoverImage(file: File): Promise<UserProfileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await httpClient.post<UserProfileResponse>('/users/profile/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getPublicProfile(username: string): Promise<UserProfileResponse> {
    const { data } = await httpClient.get<UserProfileResponse>(`/users/profile/username/${username}`);
    return data;
  },

  async getRelationshipState(username: string): Promise<{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }> {
    const { data } = await httpClient.get<{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }>(`/users/relationship/${username}`);
    return data;
  },

  async followUser(username: string): Promise<{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }> {
    const { data } = await httpClient.post<{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }>(`/users/follow/${username}`);
    return data;
  },

  async unfollowUser(username: string): Promise<{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }> {
    const { data } = await httpClient.post<{ state: 'Following' | 'Not Following' | 'Requested' | 'Blocked' | 'Self' }>(`/users/unfollow/${username}`);
    return data;
  },

  async getFollowers(
    username: string,
    limit = 10,
    cursor?: string,
    search?: string,
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const { data } = await httpClient.get<{ items: any[]; nextCursor?: string }>(
      `/users/${username}/followers`,
      { params: { limit, cursor, search } }
    );
    return data;
  },

  async getFollowing(
    username: string,
    limit = 10,
    cursor?: string,
    search?: string,
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const { data } = await httpClient.get<{ items: any[]; nextCursor?: string }>(
      `/users/${username}/following`,
      { params: { limit, cursor, search } }
    );
    return data;
  },
};
